<script lang="ts">
const servers: RTCConfiguration = {
  iceServers: [{ urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] }],
  iceCandidatePoolSize: 10,
};
const CALL_ICONS = {
  "in-call": "󰷯",
  "incoming": "󰏷",
  "none": "󰏻",
} as const;
</script>

<script setup lang="ts">
const { $realtime } = useNuxtApp();
const route = useRoute();
const pollId = Number(route.params.id);
const open = ref(false);
const pc = ref<RTCPeerConnection | null>(null);
const localStream = ref<MediaStream | null>(null);
const remoteStream = ref<MediaStream | null>(null);
const webcamVideo = ref<HTMLVideoElement | null>(null);
const remoteVideo = ref<HTMLVideoElement | null>(null);
const camOn = ref(false);
const hosting = ref(false);
const callState = ref<keyof typeof CALL_ICONS>("none");

onMounted(() => {
  pc.value = new RTCPeerConnection(servers);
  remoteStream.value = new MediaStream();
  pc.value.ontrack = addRemoteTracks;
  $realtime.on("call", pollId, onAnswer);
});

onUnmounted(() => {
  pc.value?.close();
  $realtime.off("call", pollId, onAnswer);
});

watchEffect(() => {
  if (remoteVideo.value) {
    remoteVideo.value!.srcObject = remoteStream.value;
  }
  if (!webcamVideo.value) {
    return;
  }

  if (camOn.value) {
    webcamVideo.value.srcObject = localStream.value;
  } else {
    webcamVideo.value.srcObject = null;
  }
});

async function toggleWebcam() {
  if (!localStream.value) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    localStream.value = await navigator.mediaDevices.getUserMedia({
      audio: devices.some(d => d.kind === "audioinput"),
      video: devices.some(d => d.kind === "videoinput"),
    });

    localStream.value.getTracks().forEach((track) => {
      pc.value!.addTrack(track, localStream.value!);
    });
  }

  camOn.value = !camOn.value;
}

async function handleCall() {
  switch (callState.value) {
    case "in-call": return hangup();
    case "incoming": return answerCall();
    case "none": return initCall();
  }
}

function hangup() {
  if (!pc.value) { return }
  pc.value.close();
  callState.value = "none";
  hosting.value = false;

  pc.value = new RTCPeerConnection(servers);
  pc.value.ontrack = addRemoteTracks;
  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => {
      pc.value!.addTrack(track, localStream.value!);
    });
  }
}

function addRemoteTracks(event: RTCTrackEvent) {
  event.streams[0].getTracks().forEach((track) => {
    remoteStream.value!.addTrack(track);
  });
}

async function initCall() {
  if (!pc.value) { return }
  hosting.value = true;
  pc.value.onicecandidate = (event) => {
    if (event.candidate) {
      $realtime.call({ type: "ice:offer", candidate: event.candidate.toJSON(), pollId });
    }
  };

  const offerDescription = await pc.value.createOffer();
  await pc.value.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };

  $realtime.call({ type: "offer", offer, pollId });
}

async function answerCall() {
  if (!pc.value) { return }
  pc.value.onicecandidate = (event) => {
    if (event.candidate) {
      $realtime.call({ type: "ice:answer", candidate: event.candidate.toJSON(), pollId });
    }
  };

  const answerDescription = await pc.value.createAnswer();
  await pc.value.setLocalDescription(answerDescription);
  callState.value = "in-call";

  const answer = {
    type: answerDescription.type,
    sdp: answerDescription.sdp,
  };

  $realtime.call({ type: "answer", answer, pollId });
}

async function onAnswer(call: CallRequest) {
  if (!pc.value) {
    return;
  }

  switch (call.type) {
    case "offer": {
      if (hosting.value) { return }
      const offerDescription = call.offer;
      await pc.value.setRemoteDescription(new RTCSessionDescription(offerDescription));
      callState.value = "incoming";
      break;
    }
    case "ice:offer": {
      if (hosting.value) { return }
      pc.value.addIceCandidate(new RTCIceCandidate(call.candidate));
      break;
    }
    case "answer": {
      if (hosting.value && !pc.value?.currentRemoteDescription) {
        const answerDescription = new RTCSessionDescription(call.answer);
        pc.value.setRemoteDescription(answerDescription);
        callState.value = "in-call";
      }
      break;
    }
    case "ice:answer": {
      if (!hosting.value) { return }
      const candidate = new RTCIceCandidate(call.candidate);
      pc.value.addIceCandidate(candidate);
    }
  }
}
</script>

<template>
  <button
    :class="['plain', 'no-radius', { 'accent-bg2': open }]"
    @click="open = !open"
  >
    <h4>󰏶</h4>
    <Dialog
      v-model:open="open"
      :class="[$style.videoCall, 'grid', 'no-padding']"
    >
      <section :class="[$style.cams, 'grid']">
        <span
          v-if="camOn"
          class="box-bg2"
        >
          <video
            ref="webcamVideo"
            autoplay
            playsinline
          />
        </span>
        <span class="box-bg2">
          <video
            ref="remoteVideo"
            autoplay
            playsinline
          />
        </span>
      </section>
      <section :class="[$style.controls, 'grid', 'main-fg1']">
        <button
          class="plain"
          :data-call="callState"
          @click="handleCall"
        >
          <h6>
            {{ CALL_ICONS[callState] }}
          </h6>
        </button>
        <button
          class="plain"
          @click="toggleWebcam"
        >
          <h6>
            {{ camOn ? "󱜷" : "󰖠" }}
          </h6>
        </button>
      </section>
    </Dialog>
  </button>
</template>

<style module lang="scss">
.videoCall {
  --video-w: 480px;
  grid-template-rows: 1fr auto;

  .cams {
    grid-template-columns: repeat(auto-fill, var(--video-w));
    justify-content: center;
    justify-items: center;
    align-items: center;
    padding: 2px 0;

    span {
      outline: 2px solid var(--main-fg1);
      &, video {
        width: 100%;
        height: calc(var(--video-w) * 9 / 16);
        border-radius: var(--rd1);
      }
    }
  }

  .controls {
    display: flex;
    justify-content: center;

    button {
      font-size: 0.5em;
      &[data-call="incoming"] {
        animation: beep 1s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite both;
      }
      &[data-call="in-call"] {
        background: var(--accent-bg2);
        &:hover {
          background: var(--accent-bg1);
        }
      }
    }
  }
  @keyframes beep {
    10%,
    90% {
      transform: translate3d(-1px, 0, 0);
      background: linear-gradient(to top right, var(--accent-bg1), var(--accent-bg2));
    }

    20%,
    80% {
      transform: translate3d(2px, 0, 0);
      background: linear-gradient(to bottom right, var(--accent-bg1), var(--accent-bg2));
    }

    30%,
    50%,
    70% {
      transform: translate3d(-4px, 0, 0);
      background: transparent;
    }

    40%,
    60% {
      transform: translate3d(4px, 0, 0);
      background: transparent;
    }
  }
}
</style>
