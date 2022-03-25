/* eslint-disable camelcase */
import axios from 'axios'
import { config } from '../../index'


// #region TYPE DEFINITIONS
export type Store = 'steam' | 'epic' | 'itch' | 'other'

export type ProductKind = 'game' | 'dlc' | 'software' | 'art' | 'ost' | 'book' | 'other'

export type DiscountType = 'free' | 'discount' | 'weekend' | 'unknown'


/** Game Rating */
export interface Rating {
  score: number
  source: string
  url?: string
}

export interface PlatformAvailability {
  windows: boolean
  mac: boolean
  linux: boolean
}

export interface Prices {
  eur: number
  usd: number
}

export interface Image {
  url: string
  name: string
  width: number
  height: number
}

export interface Trailer {
  thumbnail: Image
  video_url: string
}

export interface Sale {
  type: DiscountType
  price_drop: number // sale percent, e.g. 30(%)
  until: number
}


/** The data that can be found by the web scrapers */
export interface ScrapeableGameInfo {
  title: string
  prices: {
    initial: Prices
    final: Prices
  }
  sale?: Sale
  store: string
  kind: ProductKind
  platforms: PlatformAvailability
  tags: string[]
  genres: string[]
  images: Image[]
  description_short: string
  description_long: string
  ratings: Rating[]
  website: string
  legal_notice: string
  required_age: number
  release_date: string
  developer: string
  publisher: string
  trailer?: Trailer
  store_meta?: {
    steam_subids?: string[]
  }
}
// #endregion

export default class GibuGamesApi {

  private static readonly ENDPOINT_URL = ''

  public static async getDetails(url: string): Promise<ScrapeableGameInfo | null> {
    // TODO fix
    const apiUrl = `${config.thirdparty.gibuapis.gqlEndpoint}${this.ENDPOINT_URL}details?url=${encodeURIComponent(url)}`
    console.log(apiUrl)
    const { data, status } = await axios.get(apiUrl, {
      headers: { Authorization: config.thirdparty.gibuapis.key },
      validateStatus: null
    })

    if (status < 200 || status >= 300)
      return null

    return data.data
  }

}
