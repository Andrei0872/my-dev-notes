<script>
import Alert from 'bootstrap-vue/es/components/alert/alert';
import Badge from 'bootstrap-vue/es/components/badge/badge';
import Link from 'bootstrap-vue/es/components/link/link';

export default {
  name:'functional comp',
  props: ['options'],
  functional: true,
  render(h, context) {
      const { link, badge, alert } = context.props.options || {};
      
      console.warn(context)
      // It's like getting this.$slots.default
      let element = <span> { context.children } </span>

      if(link) {
        element = <Link href={link}> {element} </Link>
      }

      if(badge) {
        element = (
          <div>
            {element},
            <Badge>{ badge }</Badge>
          </div>
        );
      }

      if(alert) {
        element = <Alert show variant="success"> {element} </Alert>
      }

      return <div> { element } </div>
  }
}
</script>
