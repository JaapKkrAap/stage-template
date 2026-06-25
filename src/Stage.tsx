import {ReactElement} from "react";
import {StageBase, StageResponse, InitialData, Message} from "@chub-ai/stages-ts";

type MessageStateType = {
  tension: number;
  risk: number;
  currentPOV: string;
  consoleOpen: boolean;
  [key: string]: any;
};

type ConfigType = {
  consolePassword?: string;
  defaultPOV?: string;
};

export class Stage extends StageBase<any, any, MessageStateType, ConfigType> {
  constructor(data: InitialData<any, any, MessageStateType, ConfigType>) {
    super(data);
    this.myInternalState = data.messageState || {
      tension: 30,
      risk: 15,
      currentPOV: data.config?.defaultPOV || "male",
      consoleOpen: false
    };
  }

  async load() {
    return { success: true };
  }

  async beforePrompt(userMessage: Message): Promise<Partial<StageResponse<any, MessageStateType>>> {
    let content = userMessage.content.trim();
    let state = { ...this.myInternalState };

    // Console toggle
    if (content.match(//console|open console/i) || content.includes(this.data.config?.consolePassword || 'tension')) {
      state.consoleOpen = !state.consoleOpen;
      return {
        stageDirections: state.consoleOpen ? "[[Console opened. Commands: set tension=75, set risk=40, pov stepsister, help]]" : "[[Console closed]]",
        messageState: state
      };
    }

    // Console commands
    if (state.consoleOpen) {
      if (content.startsWith('set ')) {
        const match = content.match(/set (\w+)=(\d+)/);
        if (match) {
          const [, key, value] = match;
          (state as any)[key] = parseInt(value);
          return { messageState: state, stageDirections: `[[Updated ${key} to ${value}]]` };
        }
      }
      if (content.startsWith('/pov ')) {
        const pov = content.split(' ')[1];
        state.currentPOV = pov;
        return { messageState: state, stageDirections: `[[POV switched to ${pov}]]` };
      }
    }

    // POV directions
    let povDir = "";
    if (state.currentPOV === "male") povDir = "Tight male POV, focus on her reactions and touch.";
    else if (state.currentPOV === "stepsister" || state.currentPOV === "female") 
      povDir = "Her internal thoughts: jealousy, forbidden attraction, slowburn.";
    else if (state.currentPOV === "third") povDir = "Third-person, emotional micro-escalation.";

    return {
      stageDirections: povDir,
      messageState: state
    };
  }

  render() {
    if (!this.myInternalState.consoleOpen) return null;
    return (
      <div style={{padding: "12px", background: "#111", color: "#0f0", fontFamily: "monospace"}}>
        POV: <strong>{this.myInternalState.currentPOV}</strong> | Tension: {this.myInternalState.tension} | Risk: {this.myInternalState.risk}<br/>
        <small>Commands work in chat too</small>
      </div>
    );
  }
}