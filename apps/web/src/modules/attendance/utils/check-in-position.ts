export function getCheckInPosition(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(
        new Error(
          'อุปกรณ์นี้ไม่รองรับการอ่านพิกัด กรุณาใช้อุปกรณ์ที่รองรับ GPS',
        ),
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      (error) =>
        reject(
          new Error(
            error.code === 1
              ? 'กรุณาอนุญาตการเข้าถึงตำแหน่งเพื่อเช็คอินในรอบนี้'
              : 'อ่านตำแหน่งไม่สำเร็จ กรุณาเปิดบริการตำแหน่งแล้วลองอีกครั้ง',
          ),
        ),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
  });
}
