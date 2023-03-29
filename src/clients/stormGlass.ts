import { AxiosStatic } from 'axios'

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

export class StormGlass {
  private readonly baseURL = 'https://api.stormglass.io/v2/weather/point'

  private readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed'

  private readonly stormGlassAPISource = 'noaa'

  constructor(protected request: AxiosStatic) {}

  async fetchPoints(lat: number, lng: number): Promise<IForecastPoint[]> {
    const params = {
      lat,
      lng,
      params: this.stormGlassAPIParams,
      source: this.stormGlassAPISource
    }

    const headers = {
      Authorization: 'fake-token'
    }

    const response = await this.request.get<StormGlassForecastResponse>(
      this.baseURL,
      {
        params,
        headers
      }
    )

    return this.normalizeResponse(response.data)
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
