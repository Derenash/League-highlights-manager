export function overwolfTurnOnReplays(settings: any, callback): void {
  const parameters: overwolf.media.replays.ReplaySettings = {
    settings,
    highlights: {
      enable: false,
      requiredHighlights: ['*']
    }
  };

  overwolf.media.replays.turnOn(parameters, callback);
}


export function overwolfTurnOffReplays(callback): void {
  overwolf.media.replays.turnOff(callback);
}

export function overwolfStopCapture(replayId: string, callback: (result: overwolf.Result) => void): void {
  overwolf.media.replays.stopCapture(replayId, callback);
}

export function overwolfStartCapture(pastDuration: number, futureDuration: number, onSuccess: (result: overwolf.media.replays.ReplayResult) => void, onError: (error: string) => void): void {
  const callback: overwolf.CallbackFunction<overwolf.media.FileResult> = (result: overwolf.media.FileResult) => {
    if (result.success) {
      console.log('overwolf.media.replays.capture(): started capturing:', result);
      console.log('url:', result.url);
      console.log('path:', result.path);
      onSuccess(result);
    } else {
      console.log('overwolf.media.replays.capture(): callback error:', result.error, result);
      onError(result.error);
    }
  };

  overwolf.media.replays.startCapture(pastDuration, callback);
}