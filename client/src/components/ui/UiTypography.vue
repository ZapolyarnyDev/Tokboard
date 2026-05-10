<script>
import { computed, h } from "vue"

const toneClasses = {
  primary: "text-text-primary",
  secondary: "text-text-secondary",
  muted: "text-text-muted",
  accent: "text-accent"
}

const weightClasses = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold"
}

const headingClasses = {
  h1: "text-3xl leading-tight",
  h2: "text-2xl leading-tight",
  h3: "text-lg leading-snug",
  h4: "text-base leading-snug"
}

const textClasses = {
  lg: "text-base leading-6",
  md: "text-sm leading-5",
  sm: "text-xs leading-4"
}

function createTypographyComponent({
  name,
  defaultAs,
  baseClass,
  sizeClasses,
  defaultSize,
  defaultWeight = "regular"
}) {
  return {
    name,
    props: {
      as: { type: String, default: defaultAs },
      size: { type: String, default: defaultSize },
      tone: { type: String, default: "primary" },
      weight: { type: String, default: defaultWeight },
      truncate: { type: Boolean, default: false }
    },
    setup(props, { attrs, slots }) {
      const classes = computed(() => [
        baseClass,
        sizeClasses[props.size] || sizeClasses[defaultSize],
        toneClasses[props.tone] || toneClasses.primary,
        weightClasses[props.weight] || weightClasses[defaultWeight],
        props.truncate ? "truncate" : ""
      ])

      return () => h(props.as, { ...attrs, class: [classes.value, attrs.class] }, slots.default?.())
    }
  }
}

const Title = createTypographyComponent({
  name: "UiTypographyTitle",
  defaultAs: "h2",
  baseClass: "font-heading tracking-normal",
  sizeClasses: headingClasses,
  defaultSize: "h2",
  defaultWeight: "semibold"
})

const Text = createTypographyComponent({
  name: "UiTypographyText",
  defaultAs: "p",
  baseClass: "font-body tracking-normal",
  sizeClasses: textClasses,
  defaultSize: "md"
})

const Code = createTypographyComponent({
  name: "UiTypographyCode",
  defaultAs: "code",
  baseClass: "font-heading tracking-normal",
  sizeClasses: textClasses,
  defaultSize: "sm",
  defaultWeight: "medium"
})

const UiTypography = {
  Title,
  H1: { ...Title, name: "UiTypographyH1", props: { ...Title.props, as: { type: String, default: "h1" }, size: { type: String, default: "h1" } } },
  H2: { ...Title, name: "UiTypographyH2", props: { ...Title.props, as: { type: String, default: "h2" }, size: { type: String, default: "h2" } } },
  H3: { ...Title, name: "UiTypographyH3", props: { ...Title.props, as: { type: String, default: "h3" }, size: { type: String, default: "h3" } } },
  Text,
  Muted: { ...Text, name: "UiTypographyMuted", props: { ...Text.props, tone: { type: String, default: "secondary" } } },
  Code
}

export default UiTypography
export { Title, Text, Code }
</script>
