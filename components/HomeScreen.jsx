import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Text, NavigationContainer, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import { Marker } from 'react-native-maps';
import LocationSearch from './LocationSearch';
import GoogleMapComponent from './GoogleMapComponent';
import LocationPermission from './LocationPermission';
import NavBar from './NavBar';
import { getAllLocations } from '../scripts/axios';
import SingleLocation from './SingleLocation/SingleLocation';
import LocationPreview from './LocationPreview';

export default function HomeScreen({ navigation }) {
	const [noLocationsFound, setNoLocationsFound] = useState(false);
	const [userLocation, setUserLocation] = useState(null);
	const [locations, setLocations] = useState([]);

	useEffect(() => {
		getAllLocations()
			.then(data => {
				setLocations(locations => [...data])
			})

	}, [])
	const [region, setRegion] = useState({
		latitude: 54.6360,
		longitude: -3.3631,
		latitudeDelta: 10,
		longitudeDelta: 10,
	});

	const handleRegionSelect = (selectedRegion) => {
		console.log('SELECTED_REGION: ', selectedRegion);
		setRegion({
			latitude: selectedRegion.latitude,
			longitude: selectedRegion.longitude,
			latitudeDelta: 0.0922,
			longitudeDelta: 0.0421,
		});
	};

	const handlePermissionChange = (isGranted) => {
		if (isGranted) {
			Location.getCurrentPositionAsync({})
				.then(({ coords }) => {
					const { latitude, longitude } = coords;
					console.log('CURRENT_LOCATION: ', { coords });
					setUserLocation({
						latitude,
						longitude,
						latitudeDelta: 0.0922,
						longitudeDelta: 0.0421,
					});
					return instance.get(`locations?lat=${coords.latitude}&lon=${coords.longitude}`);
				})
				.then(({ data }) => {
					const filteredLocations = data.filter(location => {
						const distance = getDistance(
							{ latitude, longitude },
							// { latitude: userLocation.latitude, longitude: userLocation.longitude },
							{ latitude: location.coords[0], longitude: location.coords[1] }
						) / 1000;
						return distance <= 1000; //  km
					});
					if (filteredLocations.length === 0) {
						setNoLocationsFound(true)
					} else {
						setLocations(filteredLocations);
						setNoLocationsFound(false)
						console.log('FILTERED_LOCATIONS: ', filteredLocations[0].name);
					}
				})
				.catch((error) => {
					console.error('Error in fetching location or locations: ', error);
				});
		} else {
			setRegion({
				latitude: 54.6360, // UK latitude
				longitude: -3.3631, // UK longitude
				latitudeDelta: 10,
				longitudeDelta: 10,
			});
			instance.get(`locations?lat=${region.latitude}&lon=${region.longitude}&limit=6`)
				.then(({ data }) => {
					setLocations(data);
					console.log('TOP_LOCATIONS: ', data[0].name);
				})
				.catch((error) => {
					console.error('Error fetching popular locations: ', error);
				});
		}
	};

	const handleRegionChange = (newRegion) => {
		console.log('CHANGE_REGION: ', newRegion);
		setRegion(newRegion);
	}

	function handleClick(uid) {
		return navigation.navigate('SingleLocation', { uid })
	}

	return (
		<View style={styles.container}>
			<NavBar navigation={navigation} />
			<LocationPermission onPermissionChange={handlePermissionChange} />
			<View style={styles.mapContainer}>
				<GoogleMapComponent
					region={region}
					onRegionChange={handleRegionChange}
					locations={locations}
					userLocation={userLocation}
				/>
				<LocationSearch style={styles.locationSearch} onSelect={handleRegionSelect} />
			</View>
			{/* {
				!locations.length
					? (
						<ActivityIndicator size='large' />
					)
					: (
						<>
							{
								locations.map(location => {
									return (
										<TouchableOpacity
											onPress={() => handleClick(location._id)}>
											<Text style={{ fontSize: 20 }}>
												{location.name}
												{location.type}
												{location.distanceKm}
											</Text>
										</TouchableOpacity>
									)
								})
							}
						</>
					)
			} */}

			<View style={styles.locationList}>
				<ScrollView>
					{locations.map(location => (
						<LocationPreview
							key={location._id}
							name={location.name}
							type={location.type}
							distance={location.distanceKm.toFixed(2)}
							avStars={location.avStars}
						/>
					))}
				</ScrollView>
			</View>

			{/* {noLocationsFound && <Text style={styles.noLocationsText}>No locations found nearby!</Text>} */}
		</View>
	);
}



const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'fff'
	},
	noLocationsText: {
		color: 'red',
		fontSize: 16,
		textAlign: 'center',
		margin: 10,
	},
	mapContainer: {
		flex: 3
	},
	locationSearch: {
		position: 'absolute',
		top: 10,
		left: 10,
		zIndex: 2,
	},
	locationList: {
		flex: 2
	}
});