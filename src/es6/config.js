export default  {

    BRAND: {
        name: 'IBRAND',
        logo: 'https://cdn.ibrand.cc/%E6%9E%9C%E9%85%B1.jpg',
        // https://demo-open-admin.ibrand.cc/
        //https://dev-open-admin.ibrand.cc/
    },
    GLOBAL: {
        baseUrl: process.env.NODE_ENV === 'development' ? 'https://dev-open-admin.ibrand.cc/' : 'https://dev-open-admin.ibrand.cc/', // 运行时自动替换变量
    },
    PACKAGES: {
        author: true   // 是否显示技术支持
    }

}