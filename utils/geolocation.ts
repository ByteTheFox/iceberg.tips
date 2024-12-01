type IpapiResponse = {
  latitude: number;
  longitude: number;
  error?: boolean;
};

export async function getServerLocation(): Promise<IpapiResponse> {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    if (data.error) {
      throw new Error("Location detection failed");
    }

    return {
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    return {
      latitude: 40.7128, // NYC fallback
      longitude: -74.006,
      error: true,
    };
  }
}
