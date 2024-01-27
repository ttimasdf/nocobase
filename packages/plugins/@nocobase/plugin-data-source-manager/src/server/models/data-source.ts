import { MagicAttributeModel } from '@nocobase/database';
import { Application } from '@nocobase/server';
import { LocalData } from '../services/database-introspector';
import { setCurrentRole } from '@nocobase/plugin-acl';
import { AvailableActionOptions } from '@nocobase/acl';

const availableActions: {
  [key: string]: AvailableActionOptions;
} = {
  create: {
    displayName: '{{t("Add new")}}',
    type: 'new-data',
    onNewRecord: true,
    allowConfigureFields: true,
  },
  // import: {
  //   displayName: '{{t("Import")}}',
  //   type: 'new-data',
  //   scope: false,
  // },
  // export: {
  //   displayName: '{{t("Export")}}',
  //   type: 'old-data',
  //   allowConfigureFields: true,
  // },
  view: {
    displayName: '{{t("View")}}',
    type: 'old-data',
    aliases: ['get', 'list'],
    allowConfigureFields: true,
  },
  update: {
    displayName: '{{t("Edit")}}',
    type: 'old-data',
    aliases: ['update', 'move'],
    allowConfigureFields: true,
  },
  destroy: {
    displayName: '{{t("Delete")}}',
    type: 'old-data',
  },
};

export class DataSourceModel extends MagicAttributeModel {
  async loadIntoApplication(options: { app: Application }) {
    const { app } = options;
    const type = this.get('type');
    const createOptions = this.get('options');

    const dataSource = app.dataSourceManager.factory.create(type, {
      ...createOptions,
      name: this.get('key'),
    });

    const acl = dataSource.acl;

    for (const [actionName, actionParams] of Object.entries(availableActions)) {
      acl.setAvailableAction(actionName, actionParams);
    }

    acl.allow('*', '*', (ctx) => {
      return ctx.state.currentRole === 'root';
    });

    dataSource.resourceManager.use(setCurrentRole, { tag: 'setCurrentRole', before: 'acl', after: 'auth' });

    await app.dataSourceManager.add(dataSource, {
      localData: await this.loadLocalData(),
    });
  }

  private async loadLocalData(): Promise<LocalData> {
    const dataSourceKey = this.get('key');

    const remoteCollections = await this.db.getRepository('dataSourcesCollections').find({
      filter: {
        dataSourceKey,
      },
    });

    const remoteFields = await this.db.getRepository('dataSourcesFields').find({
      filter: {
        dataSourceKey,
      },
    });

    const localData = {};

    for (const remoteCollection of remoteCollections) {
      const remoteCollectionOptions = remoteCollection.toJSON();
      localData[remoteCollectionOptions.name] = remoteCollectionOptions;
    }

    for (const remoteField of remoteFields) {
      const remoteFieldOptions = remoteField.toJSON();
      const collectionName = remoteFieldOptions.collectionName;

      if (!localData[collectionName]) {
        localData[collectionName] = {
          name: collectionName,
          fields: [],
        };
      }

      if (!localData[collectionName].fields) {
        localData[collectionName].fields = [];
      }

      localData[collectionName].fields.push(remoteFieldOptions);
    }

    return localData;
  }
}