import React, { Component, Suspense } from 'react';
import FrameList from '../game/FrameList'
import '../App.css';

//Main logic for the stateful bowling game component
class Manager extends Component {

    constructor() {
        super();
        this.state = {
            started: false, //When the game starts
            roll: 0, //Current roll
            turn: 1, //Current turn, 1 is first roll in a frame, 2 is second, 3 is last frame extra roll
            frame: 1, //Current frame, 1-10
            frames: [], //Array to hold the data for each frame we are passing as props
            totalScore: 0, //Overall score of the game
            gameOver: false //To end the game

        };
        this.handleStart = this.handleStart.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleRoll = this.handleRoll.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }

    maxFrames = 10;

    newFrame() {
        //represents a single frame in the frames state array
        return {
            roll1: 0, //First roll in a given frame
            roll2: 0, //Second roll in a given frame
            roll3: 0, //Special handling for a 3rd ball int he last frame
            frame: 0, //Current frame [0 index + 1]
            id: 0, //Matches frame for the list key
            score: 0, //Represents the score from the frame
            runningScore: "", //Represents the total score up to that frame for display
            spare: false, //Has a spare occurred in the frame
            strike: false, //Has a strike occurred in the frame
            closed: false, //Is the frame closed to display the current running score
        };
    }

    nextFrame(newFrameNumber) {
        let newFrame = this.newFrame();
        newFrame.id = newFrameNumber;
        newFrame.frame = newFrameNumber;
        return newFrame;
    }

    start() {
        //Initialize the default array of frames for the game
        let newFrames = [];
        for (let i = 1; i <= this.maxFrames; i++) {
            let newFrame = this.newFrame();
            newFrame.id = i;
            newFrame.frame = i;
            newFrames.push(newFrame);
        }
        
        this.setState({
            started: true, 
            roll: 0, 
            turn: 1, 
            frame: 1, 
            frames: newFrames, 
            totalScore: 0,
            gameOver: false
        });
    }

    calculateScore(newFrames, frameIndex, spare, strike) {
        //This is going to be called for every frame to calculate the bonuses from strikes and spares
        //Those rely on information from other frames so the manager needs to track the state of all frames
        //Ideally this would be refactored into smaller functions in part, like handling strikes/spares/last frame edges seperately

        let currentScore = 0;
        let nextRoll = 0;
        let lastFrame = frameIndex + 1 === this.maxFrames;

        currentScore += newFrames[frameIndex].roll1;
        currentScore += newFrames[frameIndex].roll2;

        if (strike) {
            try {
                if (lastFrame) {
                    nextRoll = newFrames[frameIndex].roll2;
                } else {
                    nextRoll = newFrames[frameIndex + 1].roll1;
                    currentScore += nextRoll;
                }
            } catch {
                currentScore += 0;
            }
            try {
                if (!lastFrame && nextRoll < 10) {
                    currentScore += newFrames[frameIndex + 1].roll2;
                } else {
                    if (lastFrame) {
                        currentScore += newFrames[frameIndex].roll3;
                    } else if (frameIndex === this.maxFrames - 2) {
                        currentScore += newFrames[frameIndex + 1].roll2;
                    } else {
                        currentScore += newFrames[frameIndex + 2].roll1;
                    }
                }
            } catch {
                currentScore += 0;
            }
        } else if (spare) {
            try {
                if (lastFrame) {
                    nextRoll = newFrames[frameIndex].roll3;
                } else {
                    nextRoll = newFrames[frameIndex + 1].roll1;
                }
                currentScore += nextRoll;
            } catch { currentScore += 0; }
        }

        return currentScore;
    }

    setupNextTurn(newFrames, advanceFrame, nextTurn) {
        let nextFrame = this.state.frame;

        //On the last frame but "should advance"
        //Here it means we got a strike so close the frame to display the score and track additional scores to update with
        if (this.state.frame === this.maxFrames && advanceFrame) {
            if (nextTurn < 2 && newFrames[nextFrame - 1].strike) {
                newFrames[nextFrame - 1].closed = true;
                nextTurn += 1;
            }
        } else if (advanceFrame) {
            newFrames[nextFrame - 1].closed = true;
            nextFrame = Math.min(this.state.frame + 1, this.maxFrames);
        }

        this.setState({
            frames: newFrames,
            frame: nextFrame,
            turn: nextTurn
        });
    }

    updateScore() {
        //Everytime we get a new roll we can potentially back calculate previous frames with the new information
        //This lets us keep the score by frame updated in as real time as possible

        let newTotalScore = 0;
        let newFrames = this.state.frames;
        newFrames.forEach((frame) => {
            frame.score = this.calculateScore(newFrames, frame.frame - 1, frame.spare, frame.strike);
            newTotalScore += frame.score;
     
            frame.runningScore = frame.closed ? newTotalScore : "";
        })

        this.setState({
            frames: newFrames,
            totalScore: newTotalScore
        });
    }


    handleStart(e) {
        this.start();
    }

    handleChange(e) {
        //Keeps the current roll live in state and forced to be an integer or discounted roll of 0 (Gutter ball?)
        const { id, value } = e.target;
        let newValue = 0;
        try {
            newValue = parseInt(value);
            if (value < 0) {
                newValue = 0;
            }

            if (value > 10) {
                newValue = 10;
            }
        } catch (error) {
            //This would mean a number failed to parse, count the score as missed or 0 pins
            console.log(error)
        }

        this.setState({ [id]: newValue });
    }

    handleRoll(e) {
        let newFrames = this.state.frames;
        let lastFrame = this.state.frame === this.maxFrames;
        let endGame = false;

        if (this.state.turn === 1) {
            let strike = this.state.roll >= 10;
            newFrames[this.state.frame - 1].strike = strike;
            newFrames[this.state.frame - 1].roll1 = this.state.roll;
            if (this.state.frame === this.maxFrames) {
                this.setupNextTurn(this.newFrame, false, 2);
            } else {
                this.setupNextTurn(newFrames, strike, strike ? 1 : 2);
            }

        } else if (this.state.turn === 2) {
            newFrames[this.state.frame - 1].spare = newFrames[this.state.frame - 1].roll1 + this.state.roll >= 10;
            newFrames[this.state.frame - 1].roll2 = Math.min(this.state.roll, 10 - (this.state.frame !== this.maxFrames ? newFrames[this.state.frame - 1].roll1 : 0));
            if (lastFrame && !newFrames[this.state.frame - 1].spare) {
                endGame = true;
            } else {
                this.setupNextTurn(newFrames, true, this.state.frame === this.maxFrames ? 3 : 1);
            }
         
        } else if (this.state.turn === 3) {
            newFrames[this.state.frame - 1].roll3 = Math.min(this.state.roll, 10);
            newFrames[this.state.frame - 1].closed = true;
            endGame = true;
        }

        this.updateScore();
        this.setState({ gameOver: endGame });
    }

    handleReset(e) {
        this.start();
        //this.updateScore();
    }

    render() {
        /*
         * We have 3 high level states to return from the manager:
         * 1. Game not started, show a splash screen and button to start it
         * 2. Bowling game in progress
            * 2.x Bowling game is advancing frames
         * 3. Game has ended

        */
        return (<div className="game-container">
            
            {!this.state.started && <div className="game-new">Bowling Game - Unstarted
                <div>
                    <button id="start"
                        onClick={e => this.handleStart(e)}>
                        Start
                    </button></div>
                </div>
            }

            {this.state.started && <>
                <div className="game-header">Bowling Game - Frame {this.state.frame} / {this.maxFrames} {this.state.frame === this.maxFrames && this.state.turn === 3 && <> - Extra Shot</>}</div>
                <div className="game-content">
                    <FrameList
                        data={this.state.frames} /> </div>
                <div className="game-instructions">Please enter the number of pins to knockover:</div>
                <div className="game-ui">
                        <input
                            type="number"
                            id="roll"
                            value={this.state.roll}
                            min="0"
                            max="10"
                            onChange={e => this.handleChange(e)} />
                    <button id="roll"
                        onClick={e => this.handleRoll(e)}
                        disabled={this.state.gameOver}>                                           
                        Roll
                    </button>

                    <button id="reset"
                        onClick={e => this.handleReset(e)}>
                        Reset Game
                    </button>
                    </div></>
            }
            {this.state.gameOver && <div>Game over! Final Score: {this.state.totalScore}</div>}
        </div>);

    }
}

export default Manager;