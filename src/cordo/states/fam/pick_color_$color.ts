import { ButtonStyle, ComponentType, InteractionApplicationCommandCallbackData, SlotableInteraction } from 'cordo'
import * as chroma from 'chroma-js'


export default function (i: SlotableInteraction): InteractionApplicationCommandCallbackData {
  // todo: selbe farbe kann doppelt vorkommen
  // vielleicht einfach auf cordo level fixen -> selbe id vorkommt ein noop extra anhängen -> technisch gesehen unterschiedliche custom_id, aber geparsed die selbe

  const hsl = chroma(i.params.color).hsl()
  return {
    title: 'Deine Farbe:',
    image: `https://singlecolorimage.com/get/${i.params.color}/400x100`,
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: `fam_pick_color_${chroma.hsl(hsl[0] - 30, hsl[1], hsl[2]).hex().substring(1)}`,
        label: 'Hue -'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: `fam_pick_color_${chroma.hsl(hsl[0] + 30, hsl[1], hsl[2]).hex().substring(1)}`,
        label: 'Hue +'
      },
      {
        type: ComponentType.LINE_BREAK
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: `fam_pick_color_${chroma(i.params.color).darken().hex().substring(1)}`,
        label: 'Darker'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: `fam_pick_color_${chroma(i.params.color).brighten().hex().substring(1)}`,
        label: 'Brighter'
      },
      {
        type: ComponentType.LINE_BREAK
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: `fam_pick_color_${chroma(i.params.color).desaturate().hex().substring(1)}`,
        label: 'Less Saturated'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: `fam_pick_color_${chroma(i.params.color).saturate().hex().substring(1)}`,
        label: 'More Saturated'
      },
      {
        type: ComponentType.LINE_BREAK
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SUCCESS,
        custom_id: 'fam_pick_color_ff2266',
        label: 'Apply'
      }
    ]
  }
}
