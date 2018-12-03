
<script>
import Alert from 'bootstrap-vue/es/components/alert/alert';
import Link from 'bootstrap-vue/es/components/link/link';
import Badge from 'bootstrap-vue/es/components/badge/badge';

export default {
  name: 'render-func',
  props: {
    options: {
      type: Object,
      required: true
    }
  },
  render() {
    const { badge, alert, link } = this.options;

    console.log(this.$props.default)
    let element = <span> {this.$slots.default } </span>
  
    if(link) {
      element = <Link> { element } </Link>
    }

    if(badge) {
      element = (
        <div>
          {element}
          <Badge> {badge} </Badge>
        </div>
      );
    }

    if(alert) {
      element = <Alert show> {element} </Alert>
    }

    return <div>{element}</div>
 }
};
</script>
