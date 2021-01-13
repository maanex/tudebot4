import * as Jimp from 'jimp'


export default function generateInviteLinkMeme(username: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    Jimp.read('./assets/img/invite_link_meme_1.png')
      .then(async (img) => {
        const font = await Jimp.loadFont('./assets/fonts/montserrat.fnt')

        img.print(font, 7, 4, username + ':', 500)

        img.getBuffer(Jimp.MIME_PNG, (err, res) => {
          if (err) reject(err)
          else resolve(res)
        })
      })
      .catch((err) => {
        reject(err)
      })
  })
}
