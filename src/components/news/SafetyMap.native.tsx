// v1.263_001/src/components/news/SafetyMap.native.tsx
import React from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { APP } from "@/config/constants";
import { MapPinMarker } from "./MapPin";
import { MapCallout } from "./MapCallout";
import type { NewsItem } from "@/types";

interface Props {
  articles: NewsItem[];
  selectedId: string | null;
  onMarkerPress: (article: NewsItem) => void;
  onCalloutPress: (article: NewsItem) => void;
  onMapPress: () => void;
  onMapReady: () => void;
  mapRef: React.RefObject<MapView>;
}

export function SafetyMapNative({
  articles,
  selectedId,
  onMarkerPress,
  onCalloutPress,
  onMapPress,
  onMapReady,
  mapRef,
}: Props) {
  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{
        latitude: APP.defaultRegion.latitude,
        longitude: APP.defaultRegion.longitude,
        latitudeDelta: APP.defaultRegion.latitudeDelta,
        longitudeDelta: APP.defaultRegion.longitudeDelta,
      }}
      onMapReady={onMapReady}
      onPress={onMapPress}
      mapType="standard"
      showsUserLocation={false}
      showsMyLocationButton={false}
      showsCompass={true}
      rotateEnabled={false}
      pitchEnabled={false}
    >
      {articles.map((article) => {
        if (!article.location) return null;

        return (
          <Marker
            key={article.id}
            coordinate={{
              latitude: article.location.latitude,
              longitude: article.location.longitude,
            }}
            onPress={() => onMarkerPress(article)}
            tracksViewChanges={false}
          >
            <MapPinMarker
              severity={article.severity}
              category={article.category}
              isSelected={selectedId === article.id}
            />
            <Callout onPress={() => onCalloutPress(article)} tooltip>
              <MapCallout article={article} />
            </Callout>
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
