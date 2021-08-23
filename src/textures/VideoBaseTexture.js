import BaseTexture from "./BaseTexture";
import { shared } from "../ticker";
import { UPDATE_PRIORITY } from "../const";
import { uid } from "../utils";
import {
  BaseTextureCache,
  addToBaseTextureCache,
  removeFromBaseTextureCache
} from "../utils/cache";
import determineCrossOrigin from "../utils/determineCrossOrigin";

export default class VideoBaseTexture extends BaseTexture {
  constructor(source, scaleMode, autoPlay = true) {
    if (!source) {
      throw new Error("No video source element specified.");
    }

    if (
      (source.readyState === source.HAVE_ENOUGH_DATA ||
        source.readyState === source.HAVE_FUTURE_DATA) &&
      source.width &&
      source.height
    ) {
      source.complete = true;
    }

    super(source, scaleMode);

    this.width = source.videoWidth;
    this.height = source.videoHeight;
    this._autoUpdate = true;
    this._isAutoUpdating = false;

    this.autoPlay = autoPlay;
    this.update = this.update.bind(this);
    this._onCanPlay = this._onCanPlay.bind(this);

    source.addEventListener("play", this._onPlayStart.bind(this));
    source.addEventListener("pause", this._onPlayStop.bind(this));
    this.hasLoaded = false;
    this.__loaded = false;

    if (!this._isSourceReady()) {
      source.addEventListener("canplay", this._onCanPlay);
      source.addEventListener("canplaythrough", this._onCanPlay);
    } else {
      this._onCanPlay();
    }
  }

  _isSourcePlaying() {
    const source = this.source;

    return (
      source.currentTime > 0 &&
      source.paused === false &&
      source.ended === false &&
      source.readyState > 2
    );
  }

  _isSourceReady() {
    return this.source.readyState === 3 || this.source.readyState === 4;
  }

  _onPlayStart() {
    // Just in case the video has not received its can play even yet..
    if (!this.hasLoaded) {
      this._onCanPlay();
    }

    if (!this._isAutoUpdating && this.autoUpdate) {
      shared.add(this.update, this, UPDATE_PRIORITY.HIGH);
      this._isAutoUpdating = true;
    }
  }

  _onPlayStop() {
    if (this._isAutoUpdating) {
      shared.remove(this.update, this);
      this._isAutoUpdating = false;
    }
  }

  _onCanPlay() {
    this.hasLoaded = true;

    if (this.source) {
      this.source.removeEventListener("canplay", this._onCanPlay);
      this.source.removeEventListener("canplaythrough", this._onCanPlay);

      this.width = this.source.videoWidth;
      this.height = this.source.videoHeight;

      if (!this.__loaded) {
        this.__loaded = true;
        this.emit("loaded", this);
      }

      if (this._isSourcePlaying()) {
        this._onPlayStart();
      } else if (this.autoPlay) {
        this.source.play();
      }
    }
  }

  destroy() {
    if (this._isAutoUpdating) {
      shared.remove(this.update, this);
    }

    if (this.source && this.source._pixiId) {
      removeFromBaseTextureCache(this.source._pixiId);
      delete this.source._pixiId;

      this.source.pause();
      this.source.src = "";
      this.source.load();
    }

    super.destroy();
  }

  static fromUrl(videoSrc, scaleMode, crossorigin, autoPlay) {
    const video = document.createElement("video");

    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("playsinline", "");

    const url = videoSrc.src || videoSrc;
    if (crossorigin === undefined && url.indexOf("data:") !== 0) {
      video.crossOrigin = determineCrossOrigin(url);
    } else if (crossorigin) {
      video.crossOrigin =
        typeof crossorigin === "string" ? crossorigin : "anonymous";
    }

    video.appendChild(createSource(url, videoSrc.mime));
    video.load();

    return VideoBaseTexture.fromVideo(video, scaleMode, autoPlay);
  }

  get autoUpdate() {
    return this._autoUpdate;
  }

  set autoUpdate(value) {
    if (value !== this._autoUpdate) {
      this._autoUpdate = value;

      if (!this._autoUpdate && this._isAutoUpdating) {
        shared.remove(this.update, this);
        this._isAutoUpdating = false;
      } else if (this._autoUpdate && !this._isAutoUpdating) {
        shared.add(this.update, this, UPDATE_PRIORITY.HIGH);
        this._isAutoUpdating = true;
      }
    }
  }
}

VideoBaseTexture.fromUrls = VideoBaseTexture.fromUrl;

function createSource(path, type) {
  if (!type) {
    const purePath = path
      .split("?")
      .shift()
      .toLowerCase();

    type = `video/${purePath.substr(purePath.lastIndexOf(".") + 1)}`;
  }

  const source = document.createElement("source");
  source.src = path;
  source.type = type;
  return source;
}
