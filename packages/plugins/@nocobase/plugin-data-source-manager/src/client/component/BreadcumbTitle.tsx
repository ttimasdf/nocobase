import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '@nocobase/client';
import { lang, NAMESPACE } from '../locale';

export const BreadcumbTitle = () => {
  const app = useApp();
  const { name } = useParams();
  return (
    <Breadcrumb
      separator=">"
      items={[
        { title: <Link to={app.pluginSettingsManager.getRoutePath(NAMESPACE)}>{lang('Database connections')}</Link> },

        {
          title: name,
        },
      ]}
    />
  );
};