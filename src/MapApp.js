import React, { Component } from 'react';
import escapeRegExp from 'escape-string-regexp'
import './Map.css'

class MapApp extends Component {

  constructor(props) {
    super(props)
    this.state = {
      map: {},
      markers: [],
      query: '',
      infowindow: {},

      places: [{ title: 'Park Ave Penthouse', id: 1, location: { lat: 40.7713024, lng: -73.9632393 } },
      { title: 'Chelsea Loft', id: 2, location: { lat: 40.7444883, lng: -73.9949465 } },
      { title: 'Union Square Open Floor Plan', id: 3, location: { lat: 40.7347062, lng: -73.9895759 } },
      { title: 'East Village Hip Studio', id: 4, location: { lat: 40.7281777, lng: -73.984377 } },
      { title: 'TriBeCa Artsy Bachelor Pad', id: 5, location: { lat: 40.7195264, lng: -74.0089934 } },
      { title: 'Chinatown Homey Space', id: 6, location: { lat: 40.7180628, lng: -73.9961237 } }]
    }

  }

  componentDidMount() {

    var map;
    var markers = [];

    

    window.initMap = () => {

      map = new window.google.maps.Map(this.refs.map, {
        center: { lat: 40.7413549, lng: -73.9980244 },
        zoom: 13,

        mapTypeControl: false
      });

      if (map) {
        this.setState({
          map: map,

        })

      }

      var infowindow = new window.google.maps.InfoWindow()

      addMarkers(this.state.places);

      document.getElementById('go-places').addEventListener('click', textSearchPlaces);



      document.querySelector('ul').addEventListener('click', showInfo);


      document.getElementById('t-button').addEventListener('click', w3_open);

      if (document.body.clientWidth > 800) {
        w3_open()
        //document.querySelector(".options-box").style.display = "none"
      } else {
        w3_close()
      }
      w3_close()

      function w3_open() {
        if (document.querySelector(".options-box").style.display == "none") {
          document.querySelector(".options-box").style.display = "block";
        }
        else {
          w3_close()
        }
      }
      function w3_close() {
        document.querySelector(".options-box").style.display = "none";
      }



      function showInfo(e) {

        if (infowindow) {
          infowindow.close()
        }

        
        var place = places.filter((place) => place.id == e.target.id)[0];
        if (place) {
          var marker = new window.google.maps.Marker({
            map: map,
            animation: window.google.maps.Animation.BOUNCE,
            title: place.title,
            position: place.location,
            id: place.id,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10
            },


          });

          populateInfoWindow(marker, infowindow)

        }
        

      }



      function addMarkers(locations,) {

        for (var i = 0; i < locations.length; i++) {

          var position = locations[i].location;
          var title = locations[i].title;
          var id = locations[i].id;

          var marker = new window.google.maps.Marker({
            position: position,
            title: title,
            animation: window.google.maps.Animation.DROP,
            //icon: defaultIcon,
            id: id
          });
          // Push the marker to our array of markers.
          markers.push(marker);
          // Create an onclick event to open the large infowindow at each marker.
          marker.addListener('click', function () {
            populateInfoWindow(this, infowindow);
           
          });


          for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
            //bounds.extend(markers[i].position);
          }

         // var largeInfowindow = new window.google.maps.InfoWindow();

        }

      }


    }

    function hideMarkers(markers) {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
    }

    var places = this.state.places;

    function textSearchPlaces() {
      //var bounds = new window.google.maps.LatLngBounds();
      hideMarkers(markers);

      var query = document.getElementById('places-search').value;

      const match = new RegExp(escapeRegExp(query), 'i')

      places = places.filter((place) => match.test((place.title)));

      if (places.length > 0) {
        createMarkersForPlaces(places);
      }
      else {
        alert('Not Found')
      }

      // map.fitBounds(bounds);

    }


    function createMarkersForPlaces(places) {
      // var bounds = new window.google.maps.LatLngBounds();
      for (var i = 0; i < places.length; i++) {
        var place = places[i];

        // Create a marker for each place.
        var marker = new window.google.maps.Marker({
          map: map,
          title: place.title,
          position: place.location,
          id: place.id
        });
        // Create a single infowindow to be used with the place details information
        // so that only one is open at once.
        var placeInfoWindow = new window.google.maps.InfoWindow();
        // If a marker is clicked, do a place details search on it in the next function.
        marker.addListener('click', function () {
          if (placeInfoWindow.marker == this) {
            console.log("This infowindow already is on this marker!");
          } else {
            populateInfoWindow(this, placeInfoWindow);
          }
        }
        );
        markers.push(marker);

      }
      //map.fitBounds(bounds);

    }


    function populateInfoWindow(marker, infowindow) {

      

      if (infowindow) {
        infowindow.close()
      }


      marker.setAnimation(window.google.maps.Animation.BOUNCE);
      // Check to make sure the infowindow is not already opened on this marker.
      if (infowindow.marker !== marker) {
        
        infowindow.setContent('');
        infowindow.marker = marker;

        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {

          infowindow.marker = null;

        });


        // var streetViewService = new window.google.maps.StreetViewService();
        // var radius = 50;
        // // In case the status is OK, which means the pano was found, compute the
        // // position of the streetview image, then calculate the heading, then get a
        // // panorama from that and set the options
        // function getStreetView(data, status) {
        //   if (status === window.google.maps.StreetViewStatus.OK) {
        //     var nearStreetViewLocation = data.location.latLng;
        //     var heading = window.google.maps.geometry.spherical.computeHeading(
        //       nearStreetViewLocation, marker.position);
        //     infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
        //     var panoramaOptions = {
        //       position: nearStreetViewLocation,
        //       pov: {
        //         heading: heading,
        //         pitch: 30
        //       }
        //     };
        //     var panorama = new window.google.maps.StreetViewPanorama(
        //       document.getElementById('pano'), panoramaOptions);
        //   } else {
        //     infowindow.setContent('<div>' + marker.title + '</div>' +
        //       '<div>No Street View Found</div>');
        //   }
        // }
        // streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.

        infowindow.open(map, marker);
      }

      marker.setAnimation(null);



      fetch(`https://api.unsplash.com/search/photos?page=1&query=${marker.title}`, {
        headers: {
          Authorization: 'Client-ID be10602b2cbc0032a9f1b254b65b132268bbd15553eff0e11b3c4b273b19f636'
        }
      }).then(function (response) {
        return response.json();
      }).then(addImage)
        .catch(e => requestError(e, 'image'));

      function requestError(e, part) {
        console.log(e);
        var content = `<p class="network-warning">Oh no! There was an error making a request for the ${part}.</p>`

        infowindow.setContent(content);
      }

      function addImage(data) {

        const firstImage = data.results[0];

        if (firstImage) {
          var content = `<figure>
              <img src="${firstImage.urls.small}" alt="${marker.title}">
              <figcaption>${marker.title} by ${firstImage.user.name}</figcaption>
          </figure>`;
        } else {
          var content = 'Unfortunately, no image was returned for your search.'
        }
        infowindow.setContent(content);

      }
    }



  }




  textSearchPlaces = () => {

    if (this.state.query) {
      const match = new RegExp(escapeRegExp(this.state.query), 'i')
      let showingPlaces = this.state.places.filter((place) => match.test(place.title))
      this.setState({
        places: showingPlaces
      })
    } else {
      alert('No data')
    }

  }

  updateQuery = (query) => {
    this.setState({ query: query.trim() })
  }

  render() {

    var places = this.state.places.map((place, i) => {
      return (
        <li key={place.id} id={place.id}>{place.title}</li>
      )
    })
    return (
      <div className="container">

        <div className="options-box w3-sidebar w3-bar-block w3-border-right" id="mySidebar" style={{ paddingRight: 10, display: window.innerWidth > 700 ? 'block' : 'none' }}>
          <h1>Find Your Way</h1>

          <hr />

          <div>
            <span className="text">Search for nearby places</span>
            <input id="places-search" type="text" placeholder="Filter places: Chelsea Loft"
              role="search"
              value={this.state.query}
              onChange={(event) => this.updateQuery(event.target.value)} autoFocus />
            <input id="go-places" type="button" value="Go"
              onClick={this.textSearchPlaces} />
          </div>
          <ul>{places}</ul>
        </div>


        <div className="w3-teal">
          <button className="w3-button w3-teal w3-xlarge" id="t-button">☰</button>

          <h1 style={{ color: 'white' }}>Search for Nearby Places</h1>


        </div>
        <div id="map" ref="map" className="w3-container" role="application">
          loading map...
        </div>
      </div>
    )
  }
}

export default MapApp;

// style adapted from https://www.w3schools.com/w3css/tryit.asp?filename=tryw3css_sidebar_over

//images from https://api.unsplash.com/search/photos