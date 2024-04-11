export const getAqiClassName = (aqi) => {
  
  if (aqi >= 0 && aqi < 36) {
    return "blue"
  } else if (aqi >= 36 && aqi < 76) {
    return "green"
  } else if (aqi >= 76 && aqi < 116) {
    return "yellow"
  } else if (aqi >=116 && aqi < 151) {
    return "orange" 
  } else if (aqi >=151 && aqi < 251) {
    return "red" 
  } else if (aqi >=251 && aqi < 351) {
    return "purple"
  } else {
    return "black"
  }
};

// https://dev.qweather.com/docs/resource/air-info/
export const getChinaAqiClassName = (aqi) => {
  
  if (aqi >= 0 && aqi <= 50) {
    return "green"
  } else if (aqi >= 51 && aqi <= 100) {
    return "yellow"
  } else if (aqi >= 101 && aqi <= 150) {
    return "oragne"
  } else if (aqi >=151 && aqi <= 200) {
    return "red" 
  } else if (aqi >=201 && aqi <= 300) {
    return "purple" 
  } else if (aqi > 300) {
    return "maroon"
  }
};
