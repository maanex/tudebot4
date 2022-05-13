import { ButtonStyle, ComponentType, InteractionUser, MessageComponent } from 'cordo'

export function userprofileComponents(user: InteractionUser, activePage: string): MessageComponent[] {
  return [
    {
      ...shared(activePage === 'main'),
      label: user.username.substring(0, 30),
      custom_id: `userprofile_${user.id}_main`
    },
    {
      ...shared(activePage === 'collections'),
      label: 'Collections',
      custom_id: `userprofile_${user.id}_collections`
    },
    {
      ...shared(activePage === 'details'),
      label: 'Details',
      custom_id: `userprofile_${user.id}_details`
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
