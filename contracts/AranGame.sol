// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AranGame is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    enum AchievementType {
        BOOT_COMPLETE,
        GRAVITY_MASTER,
        SPEED_DEMON,
        CHAOS_SURVIVOR,
        FACTORY_ESCAPE
    }
    
    struct LeaderboardEntry {
        address player;
        uint256 score;
        uint256 timestamp;
    }
    
    struct PlayerStats {
        uint256 highScore;
        uint256 totalGamesPlayed;
        uint256 lastPlayed;
        mapping(AchievementType => bool) achievements;
    }
    
    LeaderboardEntry[] public leaderboard;
    mapping(address => PlayerStats) private playerStats;
    mapping(address => uint256) public playerLeaderboardIndex;
    mapping(address => bool) public isOnLeaderboard;
    
    uint256 public constant MAX_LEADERBOARD_SIZE = 100;
    
    string[5] public achievementURIs;
    
    event ScoreSubmitted(address indexed player, uint256 score, uint256 rank);
    event AchievementMinted(address indexed player, AchievementType achievementType, uint256 tokenId);
    
    constructor() ERC721("ARAN Achievements", "ARAN") Ownable(msg.sender) {
        achievementURIs[0] = "ipfs://QmBootComplete";
        achievementURIs[1] = "ipfs://QmGravityMaster";
        achievementURIs[2] = "ipfs://QmSpeedDemon";
        achievementURIs[3] = "ipfs://QmChaosSurvivor";
        achievementURIs[4] = "ipfs://QmFactoryEscape";
    }
    
    function submitScore(uint256 score) external {
        PlayerStats storage stats = playerStats[msg.sender];
        stats.totalGamesPlayed++;
        stats.lastPlayed = block.timestamp;
        
        if (score > stats.highScore) {
            stats.highScore = score;
            _updateLeaderboard(msg.sender, score);
        }
    }
    
    function _updateLeaderboard(address player, uint256 score) internal {
        if (isOnLeaderboard[player]) {
            uint256 index = playerLeaderboardIndex[player];
            leaderboard[index].score = score;
            leaderboard[index].timestamp = block.timestamp;
        } else {
            if (leaderboard.length < MAX_LEADERBOARD_SIZE) {
                playerLeaderboardIndex[player] = leaderboard.length;
                isOnLeaderboard[player] = true;
                leaderboard.push(LeaderboardEntry({
                    player: player,
                    score: score,
                    timestamp: block.timestamp
                }));
            } else {
                uint256 lowestIndex = _findLowestScore();
                if (score > leaderboard[lowestIndex].score) {
                    address oldPlayer = leaderboard[lowestIndex].player;
                    isOnLeaderboard[oldPlayer] = false;
                    
                    leaderboard[lowestIndex] = LeaderboardEntry({
                        player: player,
                        score: score,
                        timestamp: block.timestamp
                    });
                    playerLeaderboardIndex[player] = lowestIndex;
                    isOnLeaderboard[player] = true;
                }
            }
        }
        
        uint256 rank = _calculateRank(score);
        emit ScoreSubmitted(player, score, rank);
    }
    
    function _findLowestScore() internal view returns (uint256) {
        uint256 lowestIndex = 0;
        uint256 lowestScore = leaderboard[0].score;
        
        for (uint256 i = 1; i < leaderboard.length; i++) {
            if (leaderboard[i].score < lowestScore) {
                lowestScore = leaderboard[i].score;
                lowestIndex = i;
            }
        }
        return lowestIndex;
    }
    
    function _calculateRank(uint256 score) internal view returns (uint256) {
        uint256 rank = 1;
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i].score > score) {
                rank++;
            }
        }
        return rank;
    }
    
    function mintAchievement(AchievementType achievementType) external {
        require(!playerStats[msg.sender].achievements[achievementType], "Achievement already minted");
        
        playerStats[msg.sender].achievements[achievementType] = true;
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, achievementURIs[uint256(achievementType)]);
        
        emit AchievementMinted(msg.sender, achievementType, tokenId);
    }
    
    function hasAchievement(address player, AchievementType achievementType) external view returns (bool) {
        return playerStats[player].achievements[achievementType];
    }
    
    function getPlayerStats(address player) external view returns (
        uint256 highScore,
        uint256 totalGamesPlayed,
        uint256 lastPlayed,
        bool[5] memory achievements
    ) {
        PlayerStats storage stats = playerStats[player];
        highScore = stats.highScore;
        totalGamesPlayed = stats.totalGamesPlayed;
        lastPlayed = stats.lastPlayed;
        
        for (uint256 i = 0; i < 5; i++) {
            achievements[i] = stats.achievements[AchievementType(i)];
        }
    }
    
    function getLeaderboard(uint256 offset, uint256 limit) external view returns (
        address[] memory players,
        uint256[] memory scores,
        uint256[] memory timestamps
    ) {
        uint256 end = offset + limit;
        if (end > leaderboard.length) {
            end = leaderboard.length;
        }
        
        uint256 size = end - offset;
        players = new address[](size);
        scores = new uint256[](size);
        timestamps = new uint256[](size);
        
        for (uint256 i = 0; i < size; i++) {
            LeaderboardEntry memory entry = leaderboard[offset + i];
            players[i] = entry.player;
            scores[i] = entry.score;
            timestamps[i] = entry.timestamp;
        }
    }
    
    function getLeaderboardSize() external view returns (uint256) {
        return leaderboard.length;
    }
    
    function setAchievementURI(AchievementType achievementType, string memory uri) external onlyOwner {
        achievementURIs[uint256(achievementType)] = uri;
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
