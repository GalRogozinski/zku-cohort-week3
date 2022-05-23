// [bonus] implement an example game from part d
pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";

template HalfBlindGame() {
    // definitions 
    // PlayerCard - number that ranges between 0 and 12. Derived from PlayerCardHash % 13
    // PlayerCardHash - a random value generated in a way no player can control the outcome
    // PlayerCardHashCommitment - the hiding of PlayerCardHash
    // PlayerSecret - used to calculate PlayerCardHashCommitment

    // Public inputs
    signal input openPlayerCard; // the commitment for this is verified off circuit to ensure no cheating
    signal input stealthPlayerCardHashCommitment;
    
    // Private inputs
    signal input stealthPlayerCard;
    signal input stealthPlayerCardHash;
    signal input stealthPlayerSecret;
    //stealthPlayerCard hash / 13
    signal input mulBy13;

    // Output
    signal output stealthPlayerWins;

    // Affirm that player card is in range. We skip the openPlayerCard because it is public so verifier can verify off circuit.
    component grtThanEq1 = GreaterEqThan(4);
    component lessThan1 = LessThan(4);

    grtThanEq1.in[0] <== stealthPlayerCard;
    grtThanEq1.in[1] <== 0;
    grtThanEq1.out === 1;

    lessThan1.in[0] <== stealthPlayerCard;
    lessThan1.in[1] <== 13;
    lessThan1.out === 1;


    //affirm that the stealth player card hash matches its commitment
    component poseidon = Poseidon(2);
    poseidon.inputs[0] <== stealthPlayerCardHash;
    poseidon.inputs[1] <== stealthPlayerSecret;

    poseidon.out === stealthPlayerCardHashCommitment;

    //affirm that stealth player card was indeed calculated from the hash
    mulBy13 * 13 + stealthPlayerCard === stealthPlayerCardHash;
    
    //affirm that the stealth player card is stronger than the open player
    component grtThan = GreaterThan(4);
    grtThan.in[0] <== stealthPlayerCard;
    grtThan.in[1] <== openPlayerCard;
    grtThan.out ==> stealthPlayerWins;
    //final assertion
    stealthPlayerWins === 1;
 }

 component main {public [openPlayerCard, stealthPlayerCardHashCommitment]} = HalfBlindGame();