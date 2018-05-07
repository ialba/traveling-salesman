import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { MapService } from '../map.service';
import { GeoJson, FeatureCollection } from '../map';
import * as turf from '@turf/turf'

@Component({
  selector: 'map-box',
  templateUrl: './map-box.component.html',
  styleUrls: ['./map-box.component.css']
})
export class MapBoxComponent implements OnInit{

  /// default settings
  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/outdoors-v9';
  lat = 37.75;
  lng = -122.41;
  message = 'Hello World!';

  // data
  source: any;
  homeSource: any;
  routesSource: any;
  markers: any = [];
  home : any;

  // Setting home?
  toSetHome : any;
  hasHome : boolean = false;
  canCalculate : boolean = false;


  constructor(private mapService: MapService) {
  }

  ngOnInit() {
    this.initializeMap()
  }

  private initializeMap() {


    this.buildMap()

  }

  buildMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      zoom: 13,
      center: [this.lng, this.lat]
    });


    /// Add map controls
    this.map.addControl(new mapboxgl.NavigationControl());


    //// Add Marker on Click
    this.map.on('click', (event) => {
      const coordinates = [event.lngLat.lng, event.lngLat.lat]

      if(this.toSetHome){
        const message     = "Home";
        const newMarker   = new GeoJson(coordinates, {
          message: message,
          "marker-symbol": "monument"
        })
        this.mapService.setHome(newMarker)
        this.home = newMarker
        this.hasHome    = true
        this.toSetHome  = false
        this.homeSource.setData(newMarker)
        if(this.markers.length == 8 && this.hasHome) this.canCalculate = true
      }else if(this.markers.length<=8){
        const message = "Point - "+this.markers.length
        const newMarker   = new GeoJson(coordinates, {
          message: message
        })
        this.mapService.createMarker(newMarker)
        this.markers = this.mapService.getMarkers()
        let data = new FeatureCollection(this.markers)
        this.source.setData(data)
        if(this.markers.length == 8 && this.hasHome) this.canCalculate = true
      }
    })


    this.map.on('load', (event) => {

      /// register source
      this.map.addSource('markers', {
         type: 'geojson',
         data: {
           type: 'FeatureCollection',
           features: []
         }
      });

      /// register home source
      this.map.addSource('home', {
         type: 'geojson',
         data: {
           type: 'FeatureCollection',
           features: []
         }
      });
      // register routes source
      this.map.addSource('routes', {
         type: 'geojson',
         data: {
           type: 'FeatureCollection',
           features: []
         }
      });

      /// get source
      this.source = this.map.getSource('markers')
      this.homeSource = this.map.getSource('home')
      this.routesSource = this.map.getSource('routes')


      this.map.addLayer({
        id: 'markers',
        source: 'markers',
        type: 'symbol',
        layout: {
          'text-field': '{message}',
          'text-size': 24,
          'text-transform': 'uppercase',
          'icon-image': 'rocket-15',
          'text-offset': [0, 1.5]
        },
        paint: {
          'text-color': '#f16624',
          'text-halo-color': '#fff',
          'text-halo-width': 2
        }
      })

      this.map.addLayer({
        id: 'home',
        source: 'home',
        type: 'symbol',
        layout: {
          'text-size': 24,
          'text-transform': 'uppercase',
          'icon-image': 'town-hall-15',
          'text-offset': [0, 1.5]
        },
        paint: {
          'text-color': '#f16624',
          'text-halo-color': '#fff',
          'text-halo-width': 2
        }
      })

      this.map.addLayer({
        id: 'routes',
        source: 'routes',
        type: 'line',
        layout: {
            "line-join": "round",
            "line-cap": "round"
        },
        paint: {
            "line-color": "#888",
            "line-width": 4
        }
      })

    })

  }


  /// Helpers

  calculateRoute(){
    var data = {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "LineString",
                    "coordinates": []
                  }
                };
    var from = turf.point(this.home.geometry.coordinates);
    var to, distance;
    var minDistance = 0;
    var options = { units : 'miles'};
    var inicio = this.home;
    var nextStep;
    var stepsOrder = [];
    var stepsLeft = this.markers;

    stepsOrder.push(this.home.geometry.coordinates);

    for(var i = 0; i<= this.markers.length; i++){
      distance = 0;
      minDistance = 0;
      stepsLeft.forEach((valueB)=>{
        to = turf.point(valueB.geometry.coordinates);
        distance = turf.distance(from, to);
        if(distance < minDistance || minDistance == 0 ){
          minDistance = distance;
          nextStep = valueB;
        }
      })
      stepsOrder.push(nextStep.geometry.coordinates);
      from = turf.point(nextStep.geometry.coordinates);
      stepsLeft = stepsLeft.filter(item => item !== nextStep)
    }
    data.geometry.coordinates = stepsOrder;
    this.routesSource.setData(data);
  }

  removeMarker(marker) {
    this.mapService.removeMarker(marker.$key)
  }

  flyTo(data: GeoJson) {
    this.map.flyTo({
      center: data.geometry.coordinates
    })
  }

  setHome(){
    this.toSetHome = true;
  }
}
