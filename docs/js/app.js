/**
 * 申明数据对象
 */
const uri = './json/swagger.json'
const data = {
  swagger: '',
  info: {
    contact: {}
  },
  host: '',
  basePath: '',
  schemes: [],
  tags: [],
  paths: {},
  definitions: {},
  securityDefinitions: {},
  externalDocs: {}
}

/**
 * 从json获取数据
 */
$.getJSON(uri, res => {
  for (let i in res) {
    data[i] = res[i]
  }
  // 标签格式化
  for (let g in data.tags) {
    vm.$set(data.tags[g], 'visible', true)
  }
  // 格式化模型
  for (let t in data.definitions) {
    data.definitions[t] = {
      ...schema2Json(data.definitions[t]),
      visible: false
    }
  }
  // 格式化接口
  for (let i2 in data.paths) {
    const paths = data.paths[i2]
    for (let i3 in paths) {
      const url = paths[i3]
      vm.$set(url, 'path', i2)
      vm.$set(url, 'method', i3)
      vm.$set(url, 'visible', false)
      for (let i4 in url.responses) {
        const resp = url.responses[i4]
        if (resp.schema) {
          if (resp.schema.type) {
            resp.schema = schema2Json(resp.schema)
          } else {
            const [root, obj, params] = resp.schema.$ref.split('/')
            resp.schema = data[obj][params]
          }
        } else {
          resp.schema = {}
          // resp.schema.json = ''
        }
      }
      url.tags.map((item, index) => {
        const target = data.tags.find(item2 => {
          return item2.name === item
        })
        if (target) {
          target.data = target.data || []
          target.data.push(url)
        }
      })
    }
  }
})

/**
 * 创建VUE对象
 */
// eslint-disable-next-line no-undef
const vm = new Vue({
  el: '#app',
  data: data,
  methods: {
    handleToggleTbody (item) {
      item.visible = !item.visible
    },
    handleToggleModels (item) {
      item.visible = !item.visible
    },
    handleToggleTags (item) {
      item.visible = !item.visible
    },
    handleCopyUrl (e, text) {
      e.stopPropagation()
      const $copyInput = $('<input id="copyInput" />')
      $copyInput.val(text).appendTo('body')
      $copyInput.select()
      document.execCommand('Copy')
      $copyInput.remove()
      showToast('已复制')
    }
  }
})

/**
 * 数据转json
 * @param {*} definitions
 * @returns
 */
function schema2Json (definitions) {
  if (definitions.type === 'object') {
    definitions.json = {}
    for (let j2 in definitions.properties) {
      // console.log('definitions ==> ', definitions.properties)
      const properties = definitions.properties[j2]
      let key = j2
      let value = properties.type
      let describe = properties.description || ''
      switch (properties.type) {
        case 'integer':
          value = describe ? (properties.default || 0) + ` // ${describe}` : (properties.default || 0)
          break
        case 'boolean':
          value = describe ? (properties.default || false) + ` // ${describe}` : (properties.default || false)
          break
        default:
          value = describe ? value + ` // ${describe}` : value
          break
      }
      definitions.json[key] = value
    }
  } else if (definitions.type === 'array') {
    definitions.json = []
    const [root, obj, params] = definitions.items.$ref.split('/')
    definitions.json.push(data[obj][params].json)
  }
  return definitions
}

/**
 * Toast弹框
 */
function showToast (text = '', time = 3000) {
  const $toast = $(`
    <div class="toast">
      <div class="inner">
        <p>${text}</p>
      </div>
    </div>
  `)
  if ($('.toast').length) {
    $('.toast').remove()
  }
  $toast.appendTo('body')
  setTimeout(() => {
    $toast.remove()
  }, time)
}
