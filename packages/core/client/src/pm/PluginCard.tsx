import { DeleteOutlined, SettingOutlined, SyncOutlined } from '@ant-design/icons';
import { App, Badge, Button, Card, Col, Popconfirm, Row, Space, Switch, Typography, message } from 'antd';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import classnames from 'classnames';

import type { IPluginData } from './types';
import { useAPIClient, useRequest } from '../api-client';
import { useStyles } from './style';
import { PluginDetail } from './PluginDetail';
import { PluginUploadForm } from './PluginUploadForm';

interface IPluginInfo extends IPluginCard {
  onClick: () => void;
}

function PluginInfo(props: IPluginInfo) {
  const { data, onClick } = props;
  const {
    name,
    displayName,
    isCompatible,
    packageName,
    version,
    builtIn,
    enabled,
    compressedFileUrl,
    description,
    newVersion,
    type,
    error,
  } = data;
  const { styles, theme } = useStyles();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const api = useAPIClient();
  const { modal } = App.useApp();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [enabledVal, setEnabledVal] = useState(enabled);
  const reload = () => window.location.reload();

  const { loading: npmUpgradeLoading, run: npmUpgradeRun } = useRequest(
    { url: `pm:upgradeByNpm/${name}`, method: 'post' },
    {
      manual: true,
      onSuccess: reload,
    },
  );
  const { loading: urlUpgradeLoading, run: urlUpgradeRun } = useRequest(
    { url: `pm:upgradeByCompressedFileUrl/${name}`, method: 'post', data: { compressedFileUrl } },
    { manual: true, onSuccess: reload },
  );

  return (
    <>
      {showUploadForm && (
        <PluginUploadForm
          isShow={showUploadForm}
          name={name}
          onClose={(isRefresh) => {
            setShowUploadForm(false);
            if (isRefresh) reload();
          }}
        />
      )}
      <Card
        bordered={false}
        headStyle={{ border: 'none' }}
        bodyStyle={{ paddingTop: 5 }}
        style={{ marginBottom: theme.marginLG }}
        title={
          <div
            onClick={() => {
              !error && onClick();
            }}
          >
            {displayName || name || packageName}
          </div>
        }
        hoverable
        actions={[
          <div key="setting" className={classnames({ [styles.cardActionDisabled]: !enabled || error })}>
            <SettingOutlined
              onClick={(e) => {
                e.stopPropagation();
                if (!enabled || error) return;
                navigate(`/admin/settings/${name}`);
              }}
            />
          </div>,
          <Popconfirm
            key={'delete'}
            disabled={builtIn}
            title={t('Are you sure to delete this plugin?')}
            onConfirm={async (e) => {
              e.stopPropagation();
              await api.request({
                url: `pm:remove/${name}`,
              });
              message.success(t('The deletion was successful.'));
              window.location.reload();
            }}
            onCancel={(e) => e.stopPropagation()}
            okText={t('Yes')}
            cancelText={t('No')}
          >
            <div className={classnames({ [styles.cardActionDisabled]: builtIn })}>
              <DeleteOutlined />
            </div>
          </Popconfirm>,
          <Switch
            key={'enable'}
            size={'small'}
            disabled={builtIn || error}
            onChange={async (checked, e) => {
              e.stopPropagation();
              if (!isCompatible && checked) {
                message.error(t("Dependencies check failed, can't enable."));
                return;
              }
              modal.warning({
                title: checked ? t('Plugin starting...') : t('Plugin stopping...'),
                content: t('The application is reloading, please do not close the page.'),
                okButtonProps: {
                  style: {
                    display: 'none',
                  },
                },
              });
              setEnabledVal(checked);
              await api.request({
                url: `pm:${checked ? 'enable' : 'disable'}/${name}`,
              });
              window.location.reload();
            }}
            checked={enabledVal}
          ></Switch>,
        ]}
      >
        <Row
          justify="space-between"
          onClick={() => {
            !error && onClick();
          }}
        >
          <Col span={16}>
            <Card.Meta
              description={
                <Space style={{ height: theme.fontSize * theme.lineHeight * 4 }} direction="vertical">
                  <Typography.Text type="secondary">
                    {t('Version')}: {version}
                  </Typography.Text>
                  {!error ? (
                    <Typography.Paragraph type="secondary" ellipsis={{ rows: 3 }}>
                      {description}
                    </Typography.Paragraph>
                  ) : (
                    <Typography.Text type="danger">
                      {t('Plugin loading failed. Please check the server logs.')}
                    </Typography.Text>
                  )}
                </Space>
              }
            />
          </Col>

          <Col span={8}>
            <Space direction="vertical" align="end" style={{ display: 'flex', marginTop: -10 }}>
              {newVersion && (
                <Button
                  loading={npmUpgradeLoading}
                  icon={<SyncOutlined style={{ color: 'red', fontWeight: 'bold' }} />}
                  ghost
                  onClick={(e) => {
                    e.stopPropagation();
                    npmUpgradeRun();
                  }}
                  type="primary"
                >
                  {t('Upgrade plugin')}
                </Button>
              )}
              {type === 'url' && (
                <Button
                  ghost
                  type="primary"
                  loading={urlUpgradeLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    urlUpgradeRun();
                  }}
                >
                  {t('re-download file')}
                </Button>
              )}
              {type === 'upload' && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUploadForm(true);
                  }}
                  ghost
                  type="primary"
                >
                  {t('Upload new version')}
                </Button>
              )}
              {!isCompatible && !error && (
                <Button style={{ padding: 0 }} type="link">
                  <Typography.Text type="danger">{t('Dependencies check failed')}</Typography.Text>
                </Button>
              )}
              {!error && (
                <Button style={{ padding: 0 }} type="link">
                  {t('More details')}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>
    </>
  );
}

export interface IPluginCard {
  data: IPluginData;
}

export const PluginCard: FC<IPluginCard> = (props) => {
  const { data } = props;
  const [plugin, setPlugin] = useState<IPluginData>(undefined);

  return (
    <>
      {plugin && <PluginDetail plugin={plugin} onCancel={() => setPlugin(undefined)} />}
      <PluginInfo
        onClick={() => {
          setPlugin(data);
        }}
        data={data}
      />
    </>
  );
};