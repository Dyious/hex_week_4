
export default Vue.component('paginate',{
    template: `<nav aria-label="Page navigation example">
    <ul class="pagination">
      <li
        class="page-item"
        :class="{'disabled': pages.current_page === 1}"
      >
        <a
          class="page-link"
          href="#"
          aria-label="Previous"
          @click.prevent="pageRun(pages.current_page - 1)"
        >
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
      <li
        v-for="(item, index) in pages.total_pages"
        :key="index"
        class="page-item"
        :class="{'active': item === pages.current_page}"
      >
        <a
          class="page-link"
          href="#"
          @click.prevent="pageRun(item)"
        >{{ item }}</a>
      </li>
      <li
        class="page-item"
        :class="{'disabled': pages.current_page === pages.total_pages}"
      >
        <a
          class="page-link"
          href="#"
          aria-label="Next"
          @click.prevent="pageRun(pages.current_page + 1)"
        >
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    </ul>
  </nav>`,
    props: {
        pages: {},
      },
    
    data(){
        return{
        }
    },
    methods:{
        pageRun(item) {
            // 透過 emit 向外傳遞我們點的分頁並觸發外層的 getProducts
            this.$emit('page-run', item);
          },
    }
});