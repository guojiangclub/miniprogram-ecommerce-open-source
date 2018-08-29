/**
 * Created by admin on 2017/8/24.
 */
import Component from '../index'

export default  {

    setDefaults(){
        return {
            headerHeight: 50,
            height: '100%',
            list: [{
                text: '测试',
                template: 'rater',
                data: {}
            }]
        }
    },


    data(){
        return {
            currentIndex: 0,
        }
    },

    /**
     * 初始化样式、数据
     * @param id 命名空间
     * @param opts 传入的初始数据
     * @returns {Component}
     */
    init(id, opts) {

        const options = Object.assign({visible: false,animateCss:undefined}, this.data(), this.setDefaults(),opts)
        const scope = `$vlc.slide.${id}`;


        const updateStyles = (id, vm) => {

            const slide = vm.getComponentData();
            const currentIndex = slide.currentIndex;
            const height = slide.height;
            const headerHeight = slide.headerHeight;

            vm.setData({
                [`$vlc.slide.${id}.currentIndex`]: currentIndex,
                [`$vlc.slide.${id}.height`]: height,
                [`$vlc.slide.${id}.headerHeight`]: headerHeight,
            })
        };

        const updateValue = (id, vm) => {

            const slide = vm.getComponentData();

            const list = slide.list;

            for (let i = 0; i < list.length; i++) {

                if (!list[i].hasOwnProperty('text')) {

                    list.splice(i, 1);
                    break;
                }



                if (vm.isEmptyObject(list.data)) {

                    console.warn('property data is undefined')
                }
            }

            vm.setData({
                [`$vlc.slide.${id}.list`]: list
            })
        };

        const component = new Component({
            scope: scope,
            data: options,
            methods: {

                handlerChangeIndex(e) {
                    const slide = this.getComponentData();
                    const currentIndex = slide.currentIndex
                    if (e.currentTarget.dataset.index == currentIndex ) return;
                    this.setData({
                        [`$vlc.slide.${id}.currentIndex`]:e.currentTarget.dataset.index
                    })
                },

                handlerSwiperChange(e){
                    this.setData({
                        [`$vlc.slide.${id}.currentIndex`]:e.detail.current
                    })
                },

                show() {
                    this.setVisible()
                }
            }
        });

        updateStyles(id,component);
        updateValue(id,component);
        component.show();
        return component
    },

}