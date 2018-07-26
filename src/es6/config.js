export default  {

    BRAND: {
        name: 'IBRAND',
        logo: 'https://wx.qlogo.cn/mmhead/Q3auHgzwzM6OM5hb6yiap47BtficrcdCy0qviaOvpeYALPVBIdRzsgLxQ/0',
    },
    GLOBAL: {
        baseUrl: process.env.NODE_ENV === 'development' ? 'http://admin.dev.tnf.ibrand.cc/' : 'https://admin.viperky.com/', // 运行时自动替换变量
    },
    PACKAGES: {
        author: true   // 是否显示技术支持
    }

}