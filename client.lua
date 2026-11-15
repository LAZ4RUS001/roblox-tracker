-- Roblox Client Tracker Snippet
local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")
local MarketplaceService = game:GetService("MarketplaceService")

-- URL ประจำเซิร์ฟเวอร์ของ paneer
local API_URL = "https://roblox-tracker-hy87.onrender.com/api/ping"

local httpRequest = (syn and syn.request) or (http and http.request) or http_request or (fluxus and fluxus.request) or request
local player = Players.LocalPlayer

local gameTitle = "Unknown"
pcall(function()
    gameTitle = MarketplaceService:GetProductInfo(game.PlaceId).Name
end)

local function sendPing()
    if not httpRequest then return end

    local bodyData = {
        userId = tostring(player.UserId),
        username = player.Name,
        executor = (identifyexecutor and identifyexecutor()) or "Unknown",
        gameName = gameTitle
    }

    pcall(function()
        httpRequest({
            Url = API_URL,
            Method = "POST",
            Headers = {["Content-Type"] = "application/json"},
            Body = HttpService:JSONEncode(bodyData)
        })
    end)
end

-- ส่ง ping ทันทีที่เปิดสคริปต์
sendPing()

-- ส่ง ping ทุกๆ 45 วินาทีเพื่ออัปเดตสถานะออนไลน์
task.spawn(function()
    while task.wait(45) do
        sendPing()
    end
end)
