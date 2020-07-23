import paginate from '../component/paginate.js';
import result from '../component/result.js';


var app = new Vue({
    el:'#app',
    data:{
        products: [],
        pagination: {},
        tempProduct: {
          imageUrl: [],
        },
        isNew: false,
        status: {
          fileUploading: false,
        },
        user: {
          token: '',
          uuid: '',
        },
    },
    created() {
       
        this.user.token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        this.user.uuid = document.cookie.replace(/(?:(?:^|.*;\s*)uuid\s*\=\s*([^;]*).*$)|^.*$/, "$1") ; 
       
        // no auth rediue to login
        if (this.user.token === '') window.location = 'login.html';
      
        // 執行取得全部產品的行為
        this.getAll();

    },
    methods:{
        getAll(page = 1) {
            const api = `https://course-ec-api.hexschool.io/api/${this.user.uuid}/admin/ec/products?page=${page}`;
            //預設帶入 token
            axios.defaults.headers.common.Authorization = `Bearer ${this.user.token}`;

            axios.get(api).then((response) => {
            this.products = response.data.data; // 取得產品列表
            this.pagination = response.data.meta.pagination; // 取得分頁資訊
            });
        },
        //on
        open(data){
            this.openModal(data.way,data.item);
        },
        openModal(isNew, item) {
            switch (isNew) {
            case 'new':
                // 新增之前必須先清除原有可能暫存的資料
                this.tempProduct = {
                    imageUrl: [],
                  };
                // 切換狀態為 true 代表新增
                this.isNew = true;
                // 切換完畢並清空資料後開啟 Modal
                $('#productModal').modal('show');
                break;
            case 'edit':
                // 由於描述欄位是必須透過取得單一產品的方式，因此會執行 AJAX
                console.log(item.id);
                this.getProduct(item.id);
                // 切換狀態為 false 代表編輯
                this.isNew = false;
                break;
            case 'delete':
                // 由於目前範本僅有一層物件，因此使用淺拷貝
                this.tempProduct = Object.assign({}, item);
                // 拷貝完畢後開啟 Modal
                $('#delProductModal').modal('show');
                break;
            default:
                break;
            }
        },
        getProduct(id) {
            const api = `https://course-ec-api.hexschool.io/api/${this.user.uuid}/admin/ec/product/${id}`;
            axios.get(api).then((res) => {
              // 取得成功後回寫到 tempProduct
              this.tempProduct = res.data.data;
              // 確保資料已經回寫後在打開 Modal
              $('#productModal').modal('show');
      
            }).catch((error) => {
              console.log(error); // 若出現錯誤則顯示錯誤訊息
            });
          },
          /**
           * 上傳產品資料
           * 透過 this.isNew 的狀態將會切換新增產品或編輯產品。
           * 附註新增為「post」編輯則是「patch」，patch 必須傳入產品 ID
           */
          updateProduct() {
            // 新增商品
            let api = `https://course-ec-api.hexschool.io/api/${this.user.uuid}/admin/ec/product`;
            let httpMethod = 'post';
            // 當不是新增商品時則切換成編輯商品 API
            if (!this.isNew) {
              api = `https://course-ec-api.hexschool.io/api/${this.user.uuid}/admin/ec/product/${this.tempProduct.id}`;
              httpMethod = 'patch';
            }
      
            // 預設帶入 token
            axios.defaults.headers.common.Authorization = `Bearer ${this.user.token}`;
      
            axios[httpMethod](api, this.tempProduct).then(() => {
              $('#productModal').modal('hide'); // AJAX 新增成功後關閉 Modal
              this.getAll(); // 重新取得全部產品資料
            }).catch((error) => {
              console.log(error) // 若出現錯誤則顯示錯誤訊息
            });
          },
          /**
           * 上傳圖片
           * 詳細教學可參考影音。
           */
          uploadFile() {
            const uploadedFile = this.$refs.file.files[0];
            const formData = new FormData();
            formData.append('file', uploadedFile);
            const url = `https://course-ec-api.hexschool.io/api/${this.user.uuid}/admin/storage`;
            this.status.fileUploading = true;
            axios.post(url, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }).then((response) => {
              this.status.fileUploading = false;
              if (response.status === 200) {
                this.tempProduct.imageUrl.push(response.data.data.path);
              }
            }).catch(() => {
              console.log('上傳不可超過 2 MB');
              this.status.fileUploading = false;
            });
          },
        delProduct() {
            const url = `https://course-ec-api.hexschool.io/api/${this.user.uuid}/admin/ec/product/${this.tempProduct.id}`;

            // 預設帶入 token
            axios.defaults.headers.common.Authorization = `Bearer ${this.user.token}`;

            axios.delete(url).then(() => {
                $('#delProductModal').modal('hide'); // 刪除成功後關閉 Modal
                this.getAll(); // 重新取得全部資料
            });
        },
    },
  
    components:{
        paginate,
        result,
    }
}); 