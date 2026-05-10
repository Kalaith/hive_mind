<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Actions\ApplyIntentAction;
use App\Actions\LoadGameAction;
use App\Actions\SaveGameAction;
use App\Actions\StartGameAction;
use App\Core\Request;
use App\Core\Response;
use App\Models\AuthUser;

final class GameController
{
    public function __construct(
        private readonly LoadGameAction $loadGameAction,
        private readonly StartGameAction $startGameAction,
        private readonly SaveGameAction $saveGameAction,
        private readonly ApplyIntentAction $applyIntentAction
    ) {
    }

    public function current(Request $request, Response $response): void
    {
        $response->success($this->loadGameAction->execute($this->user($request)));
    }

    public function start(Request $request, Response $response): void
    {
        $response->success($this->startGameAction->execute($this->user($request), $request->getBody()));
    }

    public function save(Request $request, Response $response): void
    {
        $response->success($this->saveGameAction->execute($this->user($request), $request->getBody()));
    }

    public function intent(Request $request, Response $response): void
    {
        $response->success($this->applyIntentAction->execute($this->user($request), $request->getBody()));
    }

    private function user(Request $request): AuthUser
    {
        return AuthUser::fromArray($request->getAttribute('auth_user', []));
    }
}
