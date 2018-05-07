import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

import { GeoJson } from './map';
import * as mapboxgl from 'mapbox-gl';

@Injectable()
export class MapService {

  home : GeoJson;

  markers : GeoJson[] = [];


  constructor() {
    mapboxgl.accessToken = environment.mapbox.accessToken
  }

  getHome(): any {
    return this.home
  }

  setHome(data: GeoJson){
    this.home = data;
  }


  getMarkers(): any {
    return this.markers
  }

  createMarker(data: GeoJson) {
    console.log(this.markers);
    console.log(data);
    this.markers.push(data);
  }

  removeMarker($key: string) {
    //TODO Poder borrar
  }

}
