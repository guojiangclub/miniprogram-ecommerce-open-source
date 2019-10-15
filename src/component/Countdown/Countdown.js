Component({
    externalClasses: ['detail-class'],
    properties: {
        value: {
            type: String,
            value: null
        }
    },
    data: {
        day: 0,
        hour: 0,
        minute: 0,
        second:0
    },
    methods: {
        countTime() {
            var d = 86400000,
                h = 3600000,
                n = 60000,
                end = this.data.value,
                arr = String(end).split(/\D/);
            arr = arr.map(Number);
            var nowTime = new Date().getTime();
            var endTime = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]).getTime();
            var interval = endTime - nowTime;
            if (interval < 0) {
                this.setData({
                    end: false
                })
                // this.show = false;
                /*this.$emit("over");*/
            } else {
                var day = Math.floor(interval / d);
                Math.floor(interval -= day * d);
                var hour = Math.floor(interval / h);
                Math.floor(interval -= hour * h);
                var minute = Math.floor(interval / n);
                var second =Math.floor(interval% n/1000);
                this.setData({
                    day: day,
                    hour: hour,
                    minute: minute,
                    second: second
                })
            }
        }
    },
    ready() {
        setInterval(() => {
            this.countTime();
        }, 1000)
    }
})