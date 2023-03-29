import { InternalError } from '@src/util/errors/internal-error'
import * as HttpUtil from '@src/util/request'

import config, { IConfig } from 'config'

export interface IStormGlassPointSource {
  [key: string]: number
}

export interface IStormGlassPoint {
  time: string
  readonly waveHeight: IStormGlassPointSource
  readonly waveDirection: IStormGlassPointSource
  readonly swellDirection: IStormGlassPointSource
  readonly swellHeight: IStormGlassPointSource
  readonly swellPeriod: IStormGlassPointSource
  readonly windDirection: IStormGlassPointSource
  readonly windSpeed: IStormGlassPointSource
}

export interface StormGlassForecastResponse {
  hours: IStormGlassPoint[]
}

export interface IForecastPoint {
  swellDirection: number
  waveDirection: number
  windDirection: number
  swellHeight: number
  swellPeriod: number
  waveHeight: number
  windSpeed: number
  time: string
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error when trying to communicate to StormGlass'

    super(`${internalMessage}: ${message}`)
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the StormGlass service'

    super(`${internalMessage}: ${message}`)
  }
}

const stormGlassResourceConfig: IConfig = config.get('App.resources.StormGlass')

export class StormGlass {
  private readonly apiURL = `${stormGlassResourceConfig.get(
    'apiUrl'
  )}/weather/point`

  private readonly apiToken = `${stormGlassResourceConfig.get('apiToken')}`

  private readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed'

  private readonly stormGlassAPISource = 'noaa'

  constructor(protected request = new HttpUtil.Request()) {}

  async fetchPoints(lat: number, lng: number): Promise<IForecastPoint[]> {
    try {
      const params = {
        lat,
        lng,
        params: this.stormGlassAPIParams,
        source: this.stormGlassAPISource
      }

      const headers = {
        Authorization: this.apiToken
      }

      const response = await this.request.get<StormGlassForecastResponse>(
        this.apiURL,
        {
          params,
          headers
        }
      )

      return this.normalizeResponse(response.data)
    } catch (err) {
      if (err instanceof Error && HttpUtil.Request.isRequestError(err)) {
        const error = HttpUtil.Request.extractErrorData(err)
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(error.data)} Code: ${error.status}`
        )
      }
      /**
       * All the other errors will fallback to a generic client error
       */
      throw new ClientRequestError(JSON.stringify(err))
    }
  }

  private normalizeResponse(
    points: StormGlassForecastResponse
  ): IForecastPoint[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      swellDirection: point.swellDirection[this.stormGlassAPISource],
      waveDirection: point.waveDirection[this.stormGlassAPISource],
      windDirection: point.windDirection[this.stormGlassAPISource],
      swellHeight: point.swellHeight[this.stormGlassAPISource],
      swellPeriod: point.swellPeriod[this.stormGlassAPISource],
      waveHeight: point.waveHeight[this.stormGlassAPISource],
      windSpeed: point.windSpeed[this.stormGlassAPISource],
      time: point.time
    }))
  }

  private isValidPoint(point: Partial<IStormGlassPoint>) {
    return !!(
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.windDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource] &&
      point.time
    )
  }
}
