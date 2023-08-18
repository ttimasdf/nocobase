import { App, Spin } from 'antd';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ISchema } from '@formily/json-schema';
import { uid } from '@formily/shared';
import { useForm } from '@formily/react';

import { useAPIClient, useRequest } from '../../../api-client';
import { SchemaComponent } from '../../../schema-component';
import { IPluginData } from '../../types';

const id = uid();
const schema: ISchema = {
  type: 'object',
  properties: {
    [id]: {
      'x-decorator': 'Form',
      'x-component': 'div',
      type: 'void',
      'x-decorator-props': {
        useValues: '{{ useValuesFromProps }}',
      },
      properties: {
        packageName: {
          type: 'string',
          title: "{{t('Npm package name')}}",
          'x-decorator': 'FormItem',
          'x-component': 'Input',
          required: true,
          'x-component-props': {
            disabled: true,
          },
        },
        registry: {
          type: 'string',
          title: "{{t('Registry url')}}",
          'x-decorator': 'FormItem',
          'x-component': 'Input',
          required: true,
          'x-decorator-props': {
            help: 'Example: https://registry.npmjs.org/',
          },
        },
        authToken: {
          type: 'string',
          title: "{{t('Npm authToken')}}",
          'x-decorator': 'FormItem',
          'x-component': 'Input',
        },
        version: {
          type: 'string',
          title: "{{t('Version')}}",
          'x-decorator': 'FormItem',
          'x-component': 'Select',
          enum: '{{versionList}}',
        },
        footer: {
          type: 'void',
          'x-component': 'ActionBar',
          'x-component-props': {
            layout: 'one-column',
          },
          properties: {
            submit: {
              title: '{{t("Submit")}}',
              'x-component': 'Action',
              'x-component-props': {
                type: 'primary',
                htmlType: 'submit',
                useAction: '{{ useSaveValues }}',
              },
            },
            cancel: {
              title: 'Cancel',
              'x-component': 'Action',
              'x-component-props': {
                useAction: '{{ useCancel }}',
              },
            },
          },
        },
      },
    },
  },
};

interface IPluginNpmFormProps {
  onClose: (refresh?: boolean) => void;
  isUpgrade: boolean;
  pluginData?: IPluginData;
}

export const PluginNpmForm: FC<IPluginNpmFormProps> = ({ onClose, isUpgrade, pluginData }) => {
  const { message } = App.useApp();
  const { data, loading } = useRequest<{ data: string[] }>(
    {
      url: `/pm:npmVersionList/${pluginData?.name}`,
    },
    {
      refreshDeps: [pluginData?.name],
      ready: !!pluginData?.name,
    },
  );

  const versionList = useMemo(() => {
    return data?.data.map((item) => ({ label: item, value: item })) || [];
  }, [data?.data]);
  console.log('versionList', versionList, data);
  const useSaveValues = () => {
    const api = useAPIClient();
    const { t } = useTranslation();
    const form = useForm();

    return {
      async run() {
        await form.submit();
        await api.request({
          url: isUpgrade ? 'pm:upgradeByNpm/' + pluginData?.name : 'pm:addByNpm',
          method: 'post',
          data: {
            ...form.values,
            type: 'npm',
          },
        });
        message.success(t('Saved successfully'), 2, () => {
          onClose(true);
        });
      },
    };
  };

  const useValuesFromProps = (options) => {
    return useRequest(
      () =>
        Promise.resolve({
          data: pluginData,
        }),
      options,
    );
  };

  const useCancel = () => {
    return {
      run() {
        onClose();
      },
    };
  };

  schema.properties[id].properties.packageName['x-component-props'].disabled = isUpgrade;
  if (!isUpgrade) {
    delete schema.properties[id].properties.version;
  }

  if (loading) {
    return <Spin />;
  }
  return <SchemaComponent scope={{ useCancel, useSaveValues, versionList, useValuesFromProps }} schema={schema} />;
};