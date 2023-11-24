import { expect, test } from '@nocobase/test/client';
import { approximateColor } from './utils';
const formPageSchema = {
  _isJSONSchemaObject: true,
  version: '2.0',
  type: 'void',
  'x-component': 'Page',
  properties: {
    lyie34rtcu4: {
      _isJSONSchemaObject: true,
      version: '2.0',
      type: 'void',
      'x-component': 'Grid',
      'x-initializer': 'BlockInitializers',
      properties: {
        skmxkfr67em: {
          _isJSONSchemaObject: true,
          version: '2.0',
          type: 'void',
          'x-component': 'Grid.Row',
          properties: {
            '860xnb3egb8': {
              _isJSONSchemaObject: true,
              version: '2.0',
              type: 'void',
              'x-component': 'Grid.Col',
              properties: {
                aa9rqm7bkud: {
                  _isJSONSchemaObject: true,
                  version: '2.0',
                  type: 'void',
                  'x-acl-action-props': {
                    skipScopeCheck: true,
                  },
                  'x-acl-action': 'users:create',
                  'x-decorator': 'FormBlockProvider',
                  'x-decorator-props': {
                    resource: 'users',
                    collection: 'users',
                  },
                  'x-designer': 'FormV2.Designer',
                  'x-component': 'CardItem',
                  'x-component-props': {},
                  properties: {
                    t4mi2jywqj7: {
                      _isJSONSchemaObject: true,
                      version: '2.0',
                      type: 'void',
                      'x-component': 'FormV2',
                      'x-component-props': {
                        useProps: '{{ useFormBlockProps }}',
                      },
                      properties: {
                        grid: {
                          _isJSONSchemaObject: true,
                          version: '2.0',
                          type: 'void',
                          'x-component': 'Grid',
                          'x-initializer': 'FormItemInitializers',
                          'x-uid': '66dozhzo5ld',
                          'x-async': false,
                          'x-index': 1,
                        },
                        actions: {
                          _isJSONSchemaObject: true,
                          version: '2.0',
                          type: 'void',
                          'x-initializer': 'FormActionInitializers',
                          'x-component': 'ActionBar',
                          'x-component-props': {
                            layout: 'one-column',
                            style: {
                              marginTop: 24,
                            },
                          },
                          'x-uid': 'q8am9zt6m2x',
                          'x-async': false,
                          'x-index': 2,
                        },
                      },
                      'x-uid': '4ojxya0re8h',
                      'x-async': false,
                      'x-index': 1,
                    },
                  },
                  'x-uid': '183n4o77awp',
                  'x-async': false,
                  'x-index': 1,
                },
              },
              'x-uid': 'zwxgkj66isi',
              'x-async': false,
              'x-index': 1,
            },
          },
          'x-uid': '8tryd9kz9bd',
          'x-async': false,
          'x-index': 1,
        },
      },
      'x-uid': 'piwq6rrjrsq',
      'x-async': false,
      'x-index': 1,
    },
  },
  'x-uid': '5cszm46yqxb',
  'x-async': true,
  'x-index': 1,
};

test.describe('add field & remove field in block', () => {
  test('add field,then remove field in block', async ({ page, mockPage }) => {
    await mockPage({ pageSchema: formPageSchema }).goto();
    await page.getByLabel('schema-initializer-Grid-FormItemInitializers-users').hover();
    await page.getByRole('menuitem', { name: 'Nickname' }).click();
    await page.getByRole('menuitem', { name: 'Username' }).click();
    await page.getByRole('menuitem', { name: 'Email' }).click();
    //添加字段
    await expect(page.getByLabel('block-item-CollectionField-users-form-users.nickname')).toBeVisible();
    await expect(page.getByLabel('block-item-CollectionField-users-form-users.username')).toBeVisible();
    await expect(page.getByLabel('block-item-CollectionField-users-form-users.email')).toBeVisible();
    //激活的状态
    await expect(page.getByRole('menuitem', { name: 'Nickname' }).getByRole('switch')).toBeChecked();
    await expect(page.getByRole('menuitem', { name: 'Username' }).getByRole('switch')).toBeChecked();
    await expect(page.getByRole('menuitem', { name: 'Email' }).getByRole('switch')).toBeChecked();
    //移除字段
    await page.getByRole('menuitem', { name: 'Nickname' }).click();
    await page.getByRole('menuitem', { name: 'Username' }).click();
    await page.getByRole('menuitem', { name: 'Email' }).click();
    await expect(page.getByLabel('block-item-CollectionField-users-form-users.nickname')).not.toBeVisible();
    await expect(page.getByLabel('block-item-CollectionField-users-form-users.username')).not.toBeVisible();
    await expect(page.getByLabel('block-item-CollectionField-users-form-users.email')).not.toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Nickname' }).getByRole('switch')).not.toBeChecked();
    await expect(page.getByRole('menuitem', { name: 'Username' }).getByRole('switch')).not.toBeChecked();
    await expect(page.getByRole('menuitem', { name: 'Email' }).getByRole('switch')).not.toBeChecked();
  });
});

test.describe('drag field in block', () => {
  test('drag field for layout', async ({ page, mockPage }) => {
    await mockPage({ pageSchema: formPageSchema }).goto();
    await page.getByLabel('schema-initializer-Grid-FormItemInitializers-users').click();
    await page.getByRole('menuitem', { name: 'Nickname' }).click();
    await page.getByRole('menuitem', { name: 'Username' }).click();
    await page.getByRole('menuitem', { name: 'Email' }).click();

    const sourceElement = page.getByLabel('block-item-CollectionField-users-form-users.nickname');
    await sourceElement.hover();
    const source = sourceElement.getByLabel('designer-drag');
    await source.hover();
    const targetElement = page.getByLabel('block-item-CollectionField-users-form-users.username');
    await source.dragTo(targetElement);

    const targetElement2 = page.getByLabel('block-item-CollectionField-users-form-users.email');
    await source.hover();
    await source.dragTo(targetElement2);

    await sourceElement.hover();
    const nickname = await source.boundingBox();
    const username = await targetElement.boundingBox();
    const email = await targetElement2.boundingBox();
    const max = Math.max(username.y, nickname.y, email.y);
    //拖拽调整排序符合预期
    expect(nickname.y).toBe(max);
  });
});

test.describe('field setting config ', () => {
  test('edit field label in block', async ({ page, mockPage }) => {
    await mockPage({ pageSchema: formPageSchema }).goto();
    await page.getByLabel('schema-initializer-Grid-FormItemInitializers-users').hover();
    await page.getByRole('menuitem', { name: 'Username' }).click();
    await page.getByLabel('block-item-CollectionField-users-form-users.username').hover();
    await page.getByLabel('designer-schema-settings-CollectionField-FormItem.Designer-users-users.username').hover();
    await page.getByRole('menuitem', { name: 'Edit field title' }).click();
    await page.getByLabel('block-item-Input-users-Field title').getByRole('textbox').fill('Username1');
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(
      page.getByLabel('block-item-CollectionField-users-form-users.username').getByText('Username1'),
    ).toBeVisible();
    //回显
    await page.getByLabel('block-item-CollectionField-users-form-users.username').click();
    await page
      .getByLabel('block-item-CollectionField-users-form-users.username')
      .getByLabel('designer-schema-settings')
      .hover();
    await page.getByRole('menuitem', { name: 'Edit field title' }).click();
    await expect(page.getByLabel('block-item-Input-users-Field title').getByRole('textbox')).toHaveValue('Username1');
  });
  test('display & not display field label in block ', async ({ page, mockPage }) => {
    await mockPage({ pageSchema: formPageSchema }).goto();
    await page.getByLabel('schema-initializer-Grid-FormItemInitializers-users').hover();
    await page.getByRole('menuitem', { name: 'Username' }).click();
    await page.getByLabel('block-item-CollectionField-users-form-users.username').click();
    await page
      .getByLabel('block-item-CollectionField-users-form-users.username')
      .getByLabel('designer-schema-settings')
      .hover();
    await page.getByRole('menuitem', { name: 'Display title' }).hover();
    //默认显示
    await expect(page.getByRole('menuitem', { name: 'Display title' }).getByRole('switch')).toBeChecked();
    //设置不显示标题
    await page.getByRole('menuitem', { name: 'Display title' }).click();
    const labelItem = page
      .getByLabel('block-item-CollectionField-users-form-users.username')
      .locator('.ant-formily-item-label');
    const labelDisplay = await labelItem.evaluate((element) => {
      const computedStyle = window.getComputedStyle(element);
      return computedStyle.display;
    });
    expect(labelDisplay).toBe('none');
    //设置显示标题
    await page.getByLabel('block-item-CollectionField-users-form-users.username').click();
    await page
      .getByLabel('block-item-CollectionField-users-form-users.username')
      .getByLabel('designer-schema-settings')
      .hover();
    await page.getByRole('menuitem', { name: 'Display title' }).click();
    const labelDisplay1 = await labelItem.evaluate((element) => {
      const computedStyle = window.getComputedStyle(element);
      return computedStyle.display;
    });
    expect(labelDisplay1).toBe('flex');
  });
  test('edit field description ', async ({ page, mockPage }) => {
    await mockPage({ pageSchema: formPageSchema }).goto();
    const description = 'field description';
    const descriptionColor = 'rgba(0, 0, 0, 0.65)';
    await page.getByLabel('schema-initializer-Grid-FormItemInitializers-users').click();
    await page.getByRole('menuitem', { name: 'Username' }).click();
    await page.getByLabel('block-item-CollectionField-users-form-users.username').click();
    await page
      .getByLabel('block-item-CollectionField-users-form-users.username')
      .getByLabel('designer-schema-settings')
      .hover();
    await page.getByRole('menuitem', { name: 'Edit description' }).click();
    await page.getByLabel('block-item-Input.TextArea-users').locator('textarea').fill(description);
    await page.getByRole('button', { name: 'OK', exact: true }).click();
    const descriptionItem = page
      .getByLabel('block-item-CollectionField-users-form-users.username')
      .locator('.ant-formily-item-extra');
    const descriptionItemColor = await descriptionItem.evaluate((element) => {
      const computedStyle = window.getComputedStyle(element);
      return computedStyle.color;
    });
    //字段描述样式符合预期
    expect(await descriptionItem.innerText()).toBe(description);
    const isApproximate = approximateColor(descriptionItemColor, descriptionColor);
    expect(isApproximate).toBe(true);
  });
  test('field required ', async ({ page, mockPage }) => {
    await mockPage({ pageSchema: formPageSchema }).goto();
    await page.getByLabel('schema-initializer-Grid-FormItemInitializers-users').click();
    await page.getByRole('menuitem', { name: 'Nickname' }).click();
    await page.getByLabel('block-item-CollectionField-users-form-users.nickname').click();
    await page
      .getByLabel('block-item-CollectionField-users-form-users.nickname')
      .getByLabel('designer-schema-settings')
      .hover();
    await page.getByRole('menuitem', { name: 'Required' }).click();
    await page.getByLabel('schema-initializer-ActionBar-FormActionInitializers-users').click();
    await page.getByRole('menuitem', { name: 'Submit' }).click();
    await page.getByLabel('action-Action-Submit-submit-users-form').click();
    //必填校验符合预期
    await expect(
      page.getByLabel('block-item-CollectionField-users-form-users.nickname').locator('.ant-formily-item-error-help'),
    ).toBeVisible();
    const inputItem = page.getByLabel('block-item-CollectionField-users-form-users.nickname').locator('input');
    const inputErrorBorderColor = await inputItem.evaluate((element) => {
      const computedStyle = window.getComputedStyle(element);
      return computedStyle.borderColor;
    });
    //样式符合预期
    expect(inputErrorBorderColor).toBe('rgb(255, 77, 79)');
    // TODO: 该断言无效，因为在任何情况下该断言都能通过
    // 断言表单未被提交
    expect(page.getByLabel('block-item-CardItem-users-form').locator('form')).not.toHaveProperty('submitted', true);
  });
  test('field validation rule ', async ({ page, mockPage }) => {
    await mockPage({ pageSchema: formPageSchema }).goto();
    const errorMessage = 'this is error message';
    await page.getByLabel('schema-initializer-Grid-FormItemInitializers-users').click();
    await page.getByRole('menuitem', { name: 'Nickname' }).click();

    await page.getByLabel('block-item-CollectionField-users-form-users.nickname').click();
    await page
      .getByLabel('block-item-CollectionField-users-form-users.nickname')
      .getByLabel('designer-schema-settings')
      .hover();
    await page.getByRole('menuitem', { name: 'Set validation rules' }).click();
    await page.getByRole('button', { name: 'plus Add validation rule' }).click();
    await page.getByLabel('block-item-InputNumber-users-Max length').getByRole('spinbutton').fill('3');
    await page.getByRole('button', { name: 'Error message' }).locator('textarea').fill(errorMessage);
    await page.getByRole('button', { name: 'OK', exact: true }).click();
    await page.getByLabel('block-item-CollectionField-users-form-users.nickname').getByRole('textbox').fill('1111');
    const errorInfo = page
      .getByLabel('block-item-CollectionField-users-form-users.nickname')
      .locator('.ant-formily-item-error-help');
    await expect(errorInfo).toBeVisible();
    //报错信息符合预期
    expect(await errorInfo.innerText()).toBe(errorMessage);
    await page.getByLabel('schema-initializer-ActionBar-FormActionInitializers-users').click();
    await page.getByRole('menuitem', { name: 'Submit' }).click();
    await page.getByLabel('action-Action-Submit-submit-users-form').click();
    // TODO: 该断言无效，因为在任何情况下该断言都能通过
    // 断言表单未被提交
    expect(page.getByLabel('block-item-CardItem-users-form').locator('form')).not.toHaveProperty('submitted', true);
  });
  test('field pattern ', async ({ page, mockPage }) => {
    await mockPage({ pageSchema: formPageSchema }).goto();
    await page.getByLabel('schema-initializer-Grid-FormItemInitializers-users').click();
    await page.getByRole('menuitem', { name: 'Nickname' }).click();

    await page.getByLabel('block-item-CollectionField-users-form-users.nickname').click();
    const inputElement = page.getByLabel('block-item-CollectionField-users-form-users.nickname').locator('input');
    await page
      .getByLabel('block-item-CollectionField-users-form-users.nickname')
      .getByLabel('designer-schema-settings')
      .hover();
    await page.getByRole('menuitem', { name: 'Pattern' }).click();

    //禁用
    await page.getByRole('option', { name: 'Readonly' }).click();
    await expect(inputElement).toBeDisabled();
    await page.getByRole('menuitem', { name: 'Pattern' }).click();
    //只读
    await page.getByText('Easy-reading').click();
    await expect(
      page.getByLabel('block-item-CollectionField-users-form-users.nickname').locator('.ant-description-input'),
    ).toBeInViewport();
  });
});
