export const sectionHeading = (id: string) => document.getElementById(id)

export const goToSection = (id: string) => {
  const heading = sectionHeading(id)
  heading?.scrollIntoView({ block: 'start' })
  heading?.focus({ preventScroll: true })
}
