
import { Candidate } from './types';

export const INITIAL_CANDIDATES: Candidate[] = [
  { id: '1', name: 'Alice Johnson', party: 'Tech Progressive', votes: 1420, avatar: 'https://picsum.photos/seed/alice/100/100' },
  { id: '2', name: 'Bob Smith', party: 'Security First', votes: 1250, avatar: 'https://picsum.photos/seed/bob/100/100' },
  { id: '3', name: 'Charlie Davis', party: 'Decentralized Future', votes: 980, avatar: 'https://picsum.photos/seed/charlie/100/100' },
];

export const SMART_CONTRACT_TEMPLATE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleElection {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(address => bool) public voters;
    mapping(uint => Candidate) public candidates;
    uint public candidatesCount;

    event votedEvent (uint indexed _candidateId);

    constructor () {
        addCandidate("Alice Johnson");
        addCandidate("Bob Smith");
    }

    function addCandidate (string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote (uint _candidateId) public {
        require(!voters[msg.sender], "Already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");

        voters[msg.sender] = true;
        candidates[_candidateId].voteCount ++;

        emit votedEvent(_candidateId);
    }
}`;
