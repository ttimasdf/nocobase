import { InstallOptions, Plugin } from '@nocobase/server';
import { resolve } from 'path';
import { namespace } from '..';
import { enUS, zhCN } from '../locale';
import { getAuthUrl } from './actions/getAuthUrl';
import { oidc } from './authenticators/oidc';

export class OidcPlugin extends Plugin {
  afterAdd() {}

  beforeLoad() {
    this.app.i18n.addResources('zh-CN', namespace, zhCN);
    this.app.i18n.addResources('en-US', namespace, enUS);
  }

  async load() {
    // 导入 collection
    await this.db.import({
      directory: resolve(__dirname, 'collections'),
    });

    // 获取 User 插件
    const userPlugin = this.app.getPlugin<any>('users');

    // 注册 OIDC 验证器
    userPlugin.authenticators.register('oidc', oidc);

    // 注册接口
    this.app.resource({
      name: 'oidc',
      actions: {
        getAuthUrl,
      },
    });

    // 开放访问权限
    this.app.acl.allow('oidcProviders', '*');
    this.app.acl.allow('oidc', '*');
  }

  async install(options?: InstallOptions) {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default OidcPlugin;
