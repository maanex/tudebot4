import { ButtonStyle, ComponentType, InteractionUser, MessageComponent } from 'cordo'

export function userprofileComponents(user: InteractionUser, activePage: string): MessageComponent[] {
  return [
    {
      ...shared(activePage === 'main'),
      label: user.username.substring(0, 30),
      custom_id: `userprofile_${user.id}_main`
    },
    {
      ...shared(activePage === 'details'),
      label: 'Details',
      custom_id: `userprofile_${user.id}_details`
    },
    {
      ...shared(activePage === 'achievements'),
      label: 'Achievements',
      custom_id: `userprofile_${user.id}_achievements`
    }
  ]
}

function shared(active: boolean): { type: ComponentType.BUTTON, style: any, disabled: boolean } {
  return active
    ? {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SUCCESS,
        disabled: true
      }
    : {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        disabled: false
      }
}
