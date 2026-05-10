<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AuthUser;
use RuntimeException;

final class GameStateService
{
    private const UNIT_PRODUCTION = [
        'workers' => ['biomass' => 2, 'energy' => 1],
        'scouts' => ['territory' => 1, 'knowledge' => 0.5],
        'soldiers' => ['territory' => 0.5],
        'specialists' => ['knowledge' => 2, 'energy' => -1],
    ];

    private const UNIT_COSTS = [
        'workers' => ['biomass' => 10, 'energy' => 5],
        'scouts' => ['biomass' => 15, 'energy' => 10],
        'soldiers' => ['biomass' => 25, 'energy' => 15, 'knowledge' => 5],
        'specialists' => ['biomass' => 40, 'energy' => 20, 'knowledge' => 10],
    ];

    private const EVOLUTION_COSTS = [
        'enhancedMetabolism' => 100,
        'rapidGrowth' => 150,
        'knowledgeSynthesis' => 200,
        'territorialDominance' => 250,
        'hiveUnity' => 500,
    ];

    public function __construct(
        private readonly string $gameSlug,
        private readonly string $gameName
    ) {
    }

    public function initialState(): array
    {
        $now = $this->nowMs();
        return [
            'game_slug' => $this->gameSlug,
            'game_name' => $this->gameName,
            'schema_version' => 2,
            'resources' => [
                'biomass' => 50,
                'energy' => 25,
                'knowledge' => 0,
                'territory' => 0,
            ],
            'units' => [
                'workers' => 0,
                'scouts' => 0,
                'soldiers' => 0,
                'specialists' => 0,
            ],
            'evolution' => [
                'points' => 0,
                'bonuses' => [
                    'enhancedMetabolism' => false,
                    'rapidGrowth' => false,
                    'knowledgeSynthesis' => false,
                    'territorialDominance' => false,
                    'hiveUnity' => false,
                ],
            ],
            'settings' => [
                'gameSpeed' => 1,
                'lastSaved' => $now,
                'totalPlaytime' => 0,
            ],
            'production' => [
                'workers' => [],
                'scouts' => [],
                'soldiers' => [],
                'specialists' => [],
            ],
            'isGameRunning' => false,
            'created_at' => gmdate('Y-m-d H:i:s'),
        ];
    }

    public function applyIntent(array $state, string $intent, array $payload): array
    {
        $state = $this->withDefaults($state);

        return match ($intent) {
            'start_game' => $this->setRunning($state, true),
            'pause_game' => $this->setRunning($state, false),
            'reset_game' => $this->initialState(),
            'save_game' => $this->markSaved($state),
            'create_unit' => $this->createUnit($state, $payload),
            'unlock_bonus' => $this->unlockBonus($state, $payload),
            'tick' => $this->tick($state, $payload),
            default => throw new RuntimeException('Unsupported game intent: ' . $intent),
        };
    }

    public function response(array $save, AuthUser $user): array
    {
        return [
            'user' => $user->toArray(),
            'save' => [
                'id' => $save['id'],
                'slot' => $save['save_slot'],
                'state' => $this->withDefaults($save['state']),
                'metadata' => $save['metadata'],
                'version' => $save['version'],
                'status' => $save['status'],
                'created_at' => $save['created_at'],
                'updated_at' => $save['updated_at'],
            ],
        ];
    }

    private function setRunning(array $state, bool $isRunning): array
    {
        $state['isGameRunning'] = $isRunning;
        return $state;
    }

    private function markSaved(array $state): array
    {
        $state['settings']['lastSaved'] = $this->nowMs();
        return $state;
    }

    private function createUnit(array $state, array $payload): array
    {
        $unitType = $payload['unitType'] ?? null;
        if (!is_string($unitType) || !array_key_exists($unitType, self::UNIT_COSTS)) {
            throw new RuntimeException('Unknown unit type.');
        }

        if (!$this->isUnitUnlocked($state, $unitType)) {
            throw new RuntimeException('Unit type is locked.');
        }

        $cost = $this->unitCost($state, $unitType);
        $state = $this->spendResources($state, $cost);
        $state['units'][$unitType] = (int) $state['units'][$unitType] + 1;
        return $state;
    }

    private function unlockBonus(array $state, array $payload): array
    {
        $bonus = $payload['bonus'] ?? null;
        if (!is_string($bonus) || !array_key_exists($bonus, self::EVOLUTION_COSTS)) {
            throw new RuntimeException('Unknown evolution bonus.');
        }

        if ($state['evolution']['bonuses'][$bonus]) {
            return $state;
        }

        if (!$this->isBonusUnlocked($state, $bonus)) {
            throw new RuntimeException('Evolution requirements are not met.');
        }

        $state = $this->spendResources($state, ['knowledge' => self::EVOLUTION_COSTS[$bonus]]);
        $state['evolution']['bonuses'][$bonus] = true;
        return $state;
    }

    private function tick(array $state, array $payload): array
    {
        if (!$state['isGameRunning']) {
            return $state;
        }

        $deltaMs = $this->number($payload['deltaMs'] ?? 1000, 'deltaMs');
        $speedMultiplier = $this->number($payload['speedMultiplier'] ?? 1, 'speedMultiplier');
        $seconds = max(0, $deltaMs) / 1000;
        $bonuses = $state['evolution']['bonuses'];
        $productionBonus = $bonuses['enhancedMetabolism'] ? 1.25 : 1;
        $knowledgeBonus = $bonuses['knowledgeSynthesis'] ? 1.5 : 1;
        $territoryBonus = $bonuses['territorialDominance'] ? 1.3 : 1;

        foreach ($state['units'] as $unitType => $count) {
            foreach (self::UNIT_PRODUCTION[$unitType] as $resource => $amount) {
                $bonus = match ($resource) {
                    'knowledge' => $knowledgeBonus,
                    'territory' => $territoryBonus,
                    default => $productionBonus,
                };
                $state['resources'][$resource] = max(
                    0,
                    (float) $state['resources'][$resource] + ($amount * (int) $count * $bonus * $seconds * $speedMultiplier)
                );
            }
        }

        $totalUnits = array_sum(array_map('intval', $state['units']));
        if ($totalUnits > 0) {
            $state['evolution']['points'] = (float) $state['evolution']['points']
                + (log($totalUnits + 1) * 0.1 * $seconds * $speedMultiplier);
        }
        $state['settings']['totalPlaytime'] = (float) $state['settings']['totalPlaytime'] + $deltaMs;
        $state['settings']['lastSaved'] = $this->nowMs();

        return $state;
    }

    private function unitCost(array $state, string $unitType): array
    {
        $count = (int) $state['units'][$unitType];
        $multiplier = 1.15 ** $count;
        $cost = [];
        foreach (self::UNIT_COSTS[$unitType] as $resource => $amount) {
            $cost[$resource] = (int) floor($amount * $multiplier);
        }

        return $cost;
    }

    private function spendResources(array $state, array $cost): array
    {
        foreach ($cost as $resource => $amount) {
            if ((float) $state['resources'][$resource] < (float) $amount) {
                throw new RuntimeException('Insufficient resources.');
            }
        }

        foreach ($cost as $resource => $amount) {
            $state['resources'][$resource] = (float) $state['resources'][$resource] - (float) $amount;
        }

        return $state;
    }

    private function isUnitUnlocked(array $state, string $unitType): bool
    {
        return match ($unitType) {
            'workers' => true,
            'scouts' => (int) $state['units']['workers'] >= 5,
            'soldiers' => (int) $state['units']['scouts'] >= 3,
            'specialists' => (int) $state['units']['soldiers'] >= 2,
            default => false,
        };
    }

    private function isBonusUnlocked(array $state, string $bonus): bool
    {
        $bonuses = $state['evolution']['bonuses'];
        return match ($bonus) {
            'enhancedMetabolism' => true,
            'rapidGrowth' => $bonuses['enhancedMetabolism'],
            'knowledgeSynthesis' => (int) $state['units']['workers'] >= 10,
            'territorialDominance' => (int) $state['units']['scouts'] >= 5,
            'hiveUnity' => $bonuses['enhancedMetabolism']
                && $bonuses['rapidGrowth']
                && $bonuses['knowledgeSynthesis']
                && $bonuses['territorialDominance'],
            default => false,
        };
    }

    private function withDefaults(array $state): array
    {
        $initial = $this->initialState();
        return array_replace_recursive($initial, $state);
    }

    private function number(mixed $value, string $name): float
    {
        if (!is_int($value) && !is_float($value)) {
            throw new RuntimeException($name . ' must be numeric.');
        }

        return (float) $value;
    }

    private function nowMs(): int
    {
        return (int) floor(microtime(true) * 1000);
    }
}
