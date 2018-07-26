import React, { Component } from 'react';
import escapeRegExp from 'escape-string-regexp'
import './Map.css'

export class ListItem extends Component {

  render() {

    var places = this.props.places.map((place) => {
      return (
        <li key={place.id} id={place.id} tabIndex={(place.id) + 3} role="button">{place.title}</li>
      )
    })
    return (
      <ul>{places}</ul>
    )
  }

}

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

    // adapted from https://www.klaasnotfound.com/2016/11/06/making-google-maps-work-with-react/

    loadJS('https://maps.googleapis.com/maps/api/js?libraries=places,geometry,drawing&key=AIzaSyDyDTQYZsO56VMhkOel5aPghLH2nX_3SIQ&v=3&callback=initMap')

    function loadJS(src) {
      var ref = window.document.getElementsByTagName("script")[0];
      var script = window.document.createElement("script");
      script.src = src;
      script.async = true;
      ref.parentNode.insertBefore(script, ref);
    }

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

          var marker = markers.filter((marker) => marker.id == e.target.id)[0]

          if (marker) { populateInfoWindow(marker, infowindow) }

        }

      }

      function addMarkers(locations) {

        markers = locations.map(function (location, i) {
          return new window.google.maps.Marker({
            position: location.location,

            title: location.title,
            animation: window.google.maps.Animation.DROP,
            id: location.id
          });
        });

        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
          markers[i].addListener('click', function () {
            populateInfoWindow(this, infowindow);

          });

        }

      }
      function hideMarkers(markers) {

        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
      }

      var places = this.state.places;

      function textSearchPlaces() {
        hideMarkers(markers);

        var query = document.getElementById('places-search').value;

        const match = new RegExp(escapeRegExp(query), 'i')

        places = places.filter((place) => match.test((place.title)));

        if (places.length > 0) {
          addMarkers(places);
        }
        else {
          alert('Not Found')
        }

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

  }


  textSearchPlaces = () => {
    let showingPlaces
    if (this.state.query.length > 0) {
      const match = new RegExp(escapeRegExp(this.state.query), 'i')
      showingPlaces = this.state.places.filter((place) => match.test(place.title))

      this.setState({
        places: showingPlaces
      })
    }
    else if (this.state.query.length === 0) {

      window.location.reload()
    }

  }

  updateQuery = (query) => {
    this.setState({ query: query.trim() })
  }

  render() {

    return (
      <div className="container">

        <div className="options-box w3-sidebar w3-bar-block w3-border-right" id="mySidebar" style={{ paddingRight: 10, display: window.innerWidth > 700 ? 'block' : 'none' }}>
          <h1>Find Your Way</h1>

          <hr />

          <div>
            <span className="text" id="search">Search for nearby places</span>

            <input id="places-search" type="text" placeholder="Filter places: Chelsea Loft"
              role="search" aria-labelledby="search"
              value={this.state.query} tabIndex='2'
              onChange={(event) => this.updateQuery(event.target.value)} autoFocus />

            <input id="go-places" type="button" value="Filter"
              onClick={this.textSearchPlaces} tabIndex='3' />
          </div>

          <ListItem places={this.state.places} />
        </div>


        <div className="w3-teal">
          <button className="w3-button w3-teal w3-xlarge" id="t-button" tabIndex="1">☰</button>

          <h1 style={{ color: 'white' }}>Search for Nearby Places</h1>


        </div>
        <div id="map" ref="map" className="w3-container" role="application">
          Loading...
        </div>
      </div>
    )
  }
}

export default MapApp;

// style adapted from https://www.w3schools.com/w3css/tryit.asp?filename=tryw3css_sidebar_over

//images from https://api.unsplash.com/search/photos

