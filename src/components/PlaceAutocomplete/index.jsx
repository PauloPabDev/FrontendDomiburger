import { useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';

const PlaceAutocomplete = ({ InputAdress, placeChanged }) => {
  const autocompleteRef = useRef(null);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    placeChanged(place)
  };

  return (
    <Autocomplete
      onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
      onPlaceChanged={handlePlaceChanged}
    >
      <InputAdress />
    </Autocomplete>
  );
};

export default PlaceAutocomplete;
