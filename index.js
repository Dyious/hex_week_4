import zh_TW from './zh-TW.js';
// 掛載 Vue-Loading 套件
Vue.use(VueLoading);
// 全域註冊 VueLoading 並標籤設定為 loading
Vue.component('loading', VueLoading);

Vue.component('ValidationProvider', VeeValidate.ValidationProvider);
Vue.component('ValidationObserver', VeeValidate.ValidationObserver);
VeeValidate.configure({
    classes: {
        valid: 'is-valid',
        invalid: 'is-invalid',
    }
});
VeeValidate.localize('tw', zh_TW);

new Vue({
    el: '#app',
    data: {
        apiUrl: 'https://course-ec-api.hexschool.io/api/b090295f-d376-47f5-8502-94f3712a3406/ec',
        orderOwn: {
            name: '',
            email: '',
            tel: '',
            address: '',
            payment: '',
            message: '',
        },
        products: [],
        tempProduct: {},
        carInfo: {
            list: [],
            totalCost: 0,
        },
        loadingItem: '',
        isLoading: true,
    },
    methods: {
        submit() {
            this.isLoading = true;
            const vm = this;
            const url = `${vm.apiUrl}/orders`;
            // 通過驗證才會可以送出
            this.$refs.form.validate().then((success) => {
                if (success) {
                    axios.post(url, vm.orderOwn).then((res) => {
                        vm.isLoading = false;
                        $(vm.$refs.orderModal).modal('show');
                        vm.getCarList();
                    }).catch((error) => {
                        vm.isLoading = false;
                        console.log(error);
                    });
                } else {
                    console.log('你違法了雖然我不知道你怎麼進來的')
                }
            });
        },
        getProducts() {
            let vm = this;
            let url = `${vm.apiUrl}/products`;
            axios.get(url)
                .then((res) => {
                    vm.products = res.data.data;
                    vm.isLoading = false;
                })
                .catch(() => {
                    console.log('catch');
                })
        },
        getCarList() {
            let vm = this;
            vm.isLoading = true;
            const url = `${vm.apiUrl}/shopping`;

            axios.get(url).then((res) => {
                vm.carInfo.list = res.data.data;
                vm.carInfo.totalCost = 0;
                // 累加總金額
                res.data.data.forEach((item) => {
                    vm.carInfo.totalCost += item.product.price;
                });
                vm.isLoading = false;
            });
        },
        getProductItem(id) {
            this.loadingItem = id;

            const url = `${this.apiUrl}/product/${id}`;

            axios.get(url).then((response) => {
                this.tempProduct = response.data.data;
                this.$set(this.tempProduct, 'num', 0);
                $(this.$refs.productModal).modal('show');
                this.loadingItem = '';
            });
        },
        deleteItem(id) {
            let vm = this;
            vm.isLoading = true;
            const url = `${vm.apiUrl}/shopping/${id}`;
            axios.delete(url).then(() => {
                this.isLoading = false;
                this.getCarList();
            });
        },
        deleteAll() {
            this.isLoading = true;
            const url = `${this.apiUrl}/shopping/all/product`;

            axios.delete(url)
                .then(() => {
                    this.isLoading = false;
                    this.getCarList();
                });
        },
        openCarBox() {
            this.$refs.carbox.classList.toggle('open');
            this.$refs.carboxBody.classList.toggle('d-none');
        },
        addInCarBox(item, quantity = 1) {
            this.loadingItem = item.id;
            this.isLoading = true;
            const url = `${this.apiUrl}/shopping`;

            axios.post(url, {
                product: item.id,
                quantity,
            }).then(() => {
                this.loadingItem = '';
                this.isLoading = false;
                $(this.$refs.productModal).modal('hide');
                this.getCarList();
            }).catch((error) => {
                this.loadingItem = '';
                this.isLoading = false;
                $(this.$refs.productModal).modal('hide');
            });
        },
        minusRit(item,index){
            console.log(item);
            if(item === 0 && this.carInfo.list[index].quantity === 1) return;

            switch(item){
                case 0:{
                    this.carInfo.list[index].quantity -- ;
                    break;
                }
                case 1:{
                    this.carInfo.list[index].quantity ++ ;
                    break;
                }
            }
        }
    },
    created() {
        this.getProducts();
        this.getCarList();
    }
})