// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract BitPlace is Ownable {
    // ============================================================
    // Board constants
    // ============================================================

    uint16 public constant BOARD_WIDTH = 510;
    uint16 public constant BOARD_HEIGHT = 300;
    uint32 public constant TOTAL_CELLS = 153000;

    // ============================================================
    // Events
    // ============================================================

    event PixelPainted(
        address indexed painter,
        uint16 indexed x,
        uint16 indexed y,
        uint24 color
    );

    // ============================================================
    // Structs
    // ============================================================

    struct FreePaintWindow {
        uint64 windowStart;
        uint8 paintsUsedInWindow;
    }

    // ============================================================
    // Storage
    // ============================================================

    // key = flattened index (y * BOARD_WIDTH + x)
    // value = 0 means empty
    // value > 0 means painted color encoded as uint32(color) + 1
    mapping(uint32 => uint32) private pixelData;

    // per-wallet personal 24h paint window
    mapping(address => FreePaintWindow) private freePaintWindows;

    // admin painters bypass quota + fee logic
    mapping(address => bool) public adminPainters;

    // exact ETH fee required for paid paints
    uint256 public paidPaintFeeWei;

    // recipient of the 25% lottery split
    address public feeRecipient;

    // ============================================================
    // Constructor
    // ============================================================

    constructor(
        uint256 _paidPaintFeeWei,
        address _feeRecipient
    ) Ownable(msg.sender) {
        require(_feeRecipient != address(0), "Invalid fee recipient");

        paidPaintFeeWei = _paidPaintFeeWei;
        feeRecipient = _feeRecipient;
    }

    // ============================================================
    // Owner-only admin/config functions
    // ============================================================

    function setPaidPaintFeeWei(uint256 _paidPaintFeeWei) external onlyOwner {
        paidPaintFeeWei = _paidPaintFeeWei;
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    function setAdminPainter(address account, bool isAdmin) external onlyOwner {
        require(account != address(0), "Invalid admin address");
        adminPainters[account] = isAdmin;
    }

    // ============================================================
    // Read helpers
    // ============================================================

    function getPixel(uint16 x, uint16 y) external view returns (uint32) {
        require(x < BOARD_WIDTH, "X out of bounds");
        require(y < BOARD_HEIGHT, "Y out of bounds");

        uint32 index = _flatten(x, y);
        return pixelData[index];
    }

    function getPixelsRange(
        uint32 startIndex,
        uint32 count
    ) external view returns (uint32[] memory) {
        require(startIndex < TOTAL_CELLS, "Start out of bounds");
        require(count > 0, "Count must be > 0");
        require(startIndex + count <= TOTAL_CELLS, "Range out of bounds");

        uint32[] memory result = new uint32[](count);

        for (uint32 i = 0; i < count; i++) {
            result[i] = pixelData[startIndex + i];
        }

        return result;
    }

    function getCurrentWindow(
        address account
    ) external view returns (uint64 windowStart, uint8 paintsUsedInWindow) {
        FreePaintWindow memory window = freePaintWindows[account];
        return (window.windowStart, window.paintsUsedInWindow);
    }

    // ============================================================
    // Core paint function
    // ============================================================

    function paint(uint16 x, uint16 y, uint24 color) external payable {
        require(x < BOARD_WIDTH, "X out of bounds");
        require(y < BOARD_HEIGHT, "Y out of bounds");

        uint32 index = _flatten(x, y);

        bool isAdmin = adminPainters[msg.sender];
        bool shouldRunLottery = false;

        if (!isAdmin) {
            FreePaintWindow storage window = freePaintWindows[msg.sender];

            // Start a new personal 24h window if:
            // 1. this user has never painted before, or
            // 2. their previous window expired
            if (
                window.windowStart == 0 ||
                block.timestamp >= uint256(window.windowStart) + 1 days
            ) {
                window.windowStart = uint64(block.timestamp);
                window.paintsUsedInWindow = 0;
            }

            // paintsUsedInWindow is the number of paints already used
            // in the current personal window before this paint happens.
            //
            // 0 -> this is paint #1 (free)
            // 1 -> this is paint #2 (free)
            // ...
            // 4 -> this is paint #5 (free)
            // 5 -> this is paint #6 (first paid paint)
            // 6+ -> paid, but not first paid paint

            if (window.paintsUsedInWindow < 5) {
                require(msg.value == 0, "Do not send ETH for free paint");
            } else {
                require(msg.value == paidPaintFeeWei, "Incorrect ETH amount");

                if (window.paintsUsedInWindow == 5) {
                    shouldRunLottery = true;
                }
            }

            window.paintsUsedInWindow += 1;
        } else {
            require(msg.value == 0, "Admin paint should not send ETH");
        }

        // Encode color so:
        // 0 = empty
        // uint32(color) + 1 = painted color
        pixelData[index] = uint32(color) + 1;

        emit PixelPainted(msg.sender, x, y, color);

        if (shouldRunLottery) {
            _handleLottery(msg.sender);
        }
    }

    // ============================================================
    // Internal helpers
    // ============================================================

    function _flatten(uint16 x, uint16 y) internal pure returns (uint32) {
        return uint32(y) * BOARD_WIDTH + uint32(x);
    }

    function _handleLottery(address painter) internal {
        // Stub for now.
        // Later this will:
        // 1. determine whether painter wins
        // 2. if win, send:
        //    - 75% of held ETH to painter
        //    - 25% of held ETH to feeRecipient
    }
}