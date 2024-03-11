import { ref, onMounted, onUnmounted } from "vue";

export default function() {
  const cursor = ref({ x: 0, y: 0 });

  function update(event: MouseTouchEvent) {
    const { clientX, clientY } = getPagePos(event);
    cursor.value = { x: clientX, y: clientY };
  }

  onMounted(() => {
    window.addEventListener("mouseenter", update);
    window.addEventListener("touchstart", update);
    window.addEventListener("mousemove", update);
    window.addEventListener("touchmove", update);
    window.addEventListener("mouseleave", update);
    window.addEventListener("touchend", update);
  });
  onUnmounted(() => {
    window.removeEventListener("mouseenter", update);
    window.removeEventListener("touchstart", update);
    window.removeEventListener("mousemove", update);
    window.removeEventListener("touchmove", update);
    window.removeEventListener("mouseleave", update);
    window.removeEventListener("touchend", update);
  });

  return cursor;
}

export type MouseTouchEvent = MouseEvent | TouchEvent;

export function getPagePos(e: MouseTouchEvent) {
  if (window.TouchEvent && e instanceof TouchEvent) {
    return e.touches[0];
  }
  return e as MouseEvent;
}
