/**
 * 模块化组件
 * @param {Object} options 配置项
 * @param {String} options.scope 组件的命名空间
 * @param {Object} options.data 组件的动态数据
 * @param {Object} options.methods 组件的事件函数
 */
class Component {
    constructor(options = {}) {
        Object.assign(this, {
            options,
        })
        this.__init()
    }

    /**
     * 初始化
     */
    __init() {
        this.page = getCurrentPages()[getCurrentPages().length - 1]
        this.setData = this.page.setData.bind(this.page)
        this.__initState()
    }

    /**
     * 初始化组件状态
     */
    __initState() {
        this.options.data && this.__initData()
        this.options.methods && this.__initMethods()
    }

    /**
     * 绑定组件动态数据
     */
    __initData() {
        const scope = this.options.scope
        const data = this.options.data

        this._data = {}

        if (!this.isEmptyObject(data)) {
            for(let key in data) {
                if (data.hasOwnProperty(key)) {
                    if (typeof data[key] === `function`) {
                        data[key] = data[key].bind(this)
                    } else {
                        this._data[key] = data[key]
                    }
                }
            }
        }

        this.page.setData({
            [`${scope}`]: this._data,
        })
    }

    /**
     * 绑定组件事件函数
     */
    __initMethods() {
        const scope = this.options.scope
        const methods = this.options.methods

        // 筛选函数类型
        if (!this.isEmptyObject(methods)) {
            for(let key in methods) {
                if (methods.hasOwnProperty(key) && typeof methods[key] === `function`) {
                    this[key] = methods[key] = methods[key].bind(this)

                    this.page[`${scope}.${key}`] = methods[key]

                    this.setData({
                        [`${scope}.${key}`]: `${scope}.${key}`,
                    })
                }
            }
        }
    }

    /**
     * 获取组件的 data 数据
     */
    getComponentData() {
        let data = this.page.data
        let name = this.options.scope && this.options.scope.split(`.`)

        name.forEach((n, i) => {
            data = data[n]
        })

        return data
    }

    /**
     * 判断 object 是否为空
     */
    isEmptyObject(e) {
        for (let t in e)
            return !1
        return !0
    }

    /**
     * 设置元素显示
     */
    setVisible(className = `weui-animate-fade-in`) {
        this.setData({
            [`${this.options.scope}.animateCss`]: className,
            [`${this.options.scope}.visible`]: !0,
        })
    }

    /**
     * 设置元素隐藏
     */
    setHidden(className = `weui-animate-fade-out`, timer = 300) {
        this.setData({
            [`${this.options.scope}.animateCss`]: className,
        })
        setTimeout(() => {
            this.setData({
                [`${this.options.scope}.visible`]: !1,
            })
        }, timer)
    }
}

export default Component