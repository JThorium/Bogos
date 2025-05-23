import pygame
import random

# --- Configuration (some might be moved from main.py or duplicated/adjusted) ---
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600

# Colors
WHITE = (255, 255, 255)
GREEN = (0, 255, 0) # Default UFO Alpha color
CYAN = (0, 255, 255) # Player with rapid fire / UFO Beta color
RED = (255, 0, 0)
ORANGE = (255, 165, 0) # RapidFire Power-up item color
MAGENTA = (255, 0, 255) # UFO Beta bullet color
SHIELD_BLUE = (0, 180, 255) # Shield Power-up item color / Player shield visual
GOLD = (255, 215, 0) # Alternative for player shield visual

# UFO Types Configuration
UFO_TYPES = {
    "ALPHA": {
        "name": "Alpha",
        "color": GREEN,
        "speed": 5,
        "shoot_cooldown_normal": 500,
        "shoot_cooldown_rapid": 150,
        "bullet_speed": -10, # Negative goes up
        "bullet_color": WHITE,
        "width": 50,
        "height": 50,
    },
    "BETA": {
        "name": "Beta",
        "color": CYAN, # Different base color for Beta
        "speed": 4, # Slower movement
        "shoot_cooldown_normal": 450, # Slightly faster base shooting
        "shoot_cooldown_rapid": 120, # Slightly faster rapid shooting
        "bullet_speed": -12, # Faster bullets
        "bullet_color": MAGENTA, # Different bullet color
        "width": 50, # Same size for now
        "height": 50,
    }
}


# Bullet settings
BULLET_WIDTH = 5
BULLET_HEIGHT = 15
ENEMY_BULLET_SPEED = 5   # Positive goes down

# Power-up settings
POWER_UP_RADIUS = 10
POWER_UP_SPEED = 2
POWER_UP_DURATION_MS = 7000

# Enemy settings (from main.py, might be centralized better later)
ENEMY_TYPES = {
    "standard": {"health": 1, "color": RED, "points": 10, "speed_mult": 1.0, "shoot_mult": 1.0},
    "scout": {"health": 1, "color": (0,0,255), "points": 15, "speed_mult": 1.2, "shoot_mult": 1.1}, # BLUE
    "tank": {"health": 2, "color": (0,100,0), "damaged_color": (0,180,0), "points": 30, "speed_mult": 1.0, "shoot_mult": 0.8} # DARK_GREEN, LIGHT_GREEN
}
ENEMY_BULLET_WIDTH = 5
ENEMY_BULLET_HEIGHT = 15
ENEMY_BULLET_COLOR = (255, 100, 0) # Orange-ish Red for enemy bullets


class Player(pygame.sprite.Sprite):
    def __init__(self, ufo_type_name="ALPHA"): # Default to ALPHA
        super().__init__()
        
        self.ufo_type_name = ufo_type_name
        config = UFO_TYPES[self.ufo_type_name]

        self.width = config["width"]
        self.height = config["height"]
        self.image = pygame.Surface([self.width, self.height])
        
        self.base_color = config["color"] # Base color from UFO type
        self.current_display_color = self.base_color # Color used for drawing
        self.image.fill(self.current_display_color)
        
        self.rect = self.image.get_rect()
        self.rect.x = (SCREEN_WIDTH - self.width) // 2
        self.rect.y = SCREEN_HEIGHT - self.height - 10
        
        self.speed = config["speed"]
        self.shoot_cooldown_normal = config["shoot_cooldown_normal"]
        self.shoot_cooldown_rapid = config["shoot_cooldown_rapid"]
        self.bullet_speed = config["bullet_speed"]
        self.bullet_color = config["bullet_color"]

        self.current_shoot_cooldown = self.shoot_cooldown_normal
        self.last_shot_time = 0
        self.rapid_fire_active = False
        self.rapid_fire_end_time = 0
        
        self.has_shield = False
        # self.shield_visual_color = GOLD # Or SHIELD_BLUE, if different from item
        
        self.health = 1 # For future use

    def move(self, direction):
        if direction == "left" and self.rect.left > 0:
            self.rect.x -= self.speed
        if direction == "right" and self.rect.right < SCREEN_WIDTH:
            self.rect.x += self.speed

    def shoot(self, all_sprites_group, bullets_group):
        current_time = pygame.time.get_ticks()
        if current_time - self.last_shot_time > self.current_shoot_cooldown:
            self.last_shot_time = current_time
            # Use UFO-specific bullet properties
            bullet = Bullet(self.rect.centerx, self.rect.top, self.bullet_speed, self.bullet_color)
            all_sprites_group.add(bullet)
            bullets_group.add(bullet)
            return True 
        return False 

    def activate_rapid_fire(self):
        self.rapid_fire_active = True
        self.rapid_fire_end_time = pygame.time.get_ticks() + POWER_UP_DURATION_MS
        self.current_shoot_cooldown = self.shoot_cooldown_rapid
        # Visual update handled in update()

    def activate_shield(self):
        self.has_shield = True
        # Visual update handled in update()

    def lose_shield(self):
        self.has_shield = False
        # Visual update handled in update()

    def update(self):
        # Determine display color based on state precedence: Shield > RapidFire > Base
        if self.has_shield:
            self.current_display_color = GOLD # Shield visual takes precedence
        elif self.rapid_fire_active:
            current_time = pygame.time.get_ticks()
            if current_time > self.rapid_fire_end_time:
                self.rapid_fire_active = False
                self.current_shoot_cooldown = self.shoot_cooldown_normal
                self.current_display_color = self.base_color # Revert to UFO's base color
            else: 
                 self.current_display_color = CYAN # Keep rapid fire color
                 self.current_shoot_cooldown = self.shoot_cooldown_rapid # Ensure cooldown stays rapid
        else: # No shield, no active rapid fire
            self.current_shoot_cooldown = self.shoot_cooldown_normal
            self.current_display_color = self.base_color 
        
        self.image.fill(self.current_display_color)


class Enemy(pygame.sprite.Sprite):
    def __init__(self, x, y, enemy_type_name, width=50, height=50):
        super().__init__()
        self.width = width
        self.height = height
        
        self.enemy_type_name = enemy_type_name
        config = ENEMY_TYPES[enemy_type_name]
        
        self.health = config["health"]
        self.max_health = config["health"]
        self.points = config["points"]
        self.speed_mult = config["speed_mult"]
        self.shoot_mult = config["shoot_mult"]
        self.base_color = config["color"]
        self.damaged_color = config.get("damaged_color")
        self.current_color = self.base_color

        self.image = pygame.Surface([self.width, self.height])
        self.image.fill(self.current_color)
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y

    def update_movement(self, current_enemy_group_speed_x):
        self.rect.x += current_enemy_group_speed_x * self.speed_mult
        
    def take_damage(self):
        self.health -= 1
        if self.health <= 0:
            self.kill() # Remove from all groups
            return True # Died
        elif self.enemy_type_name == "tank" and self.damaged_color:
            self.current_color = self.damaged_color
            self.image.fill(self.current_color)
        return False # Still alive

    def shoot(self, all_sprites_group, enemy_bullets_group, base_shoot_chance):
        if random.random() < (base_shoot_chance * self.shoot_mult):
            bullet = Bullet(self.rect.centerx, self.rect.bottom, ENEMY_BULLET_SPEED, ENEMY_BULLET_COLOR, type="enemy")
            all_sprites_group.add(bullet)
            enemy_bullets_group.add(bullet)


class Bullet(pygame.sprite.Sprite):
    def __init__(self, x, y, speed_y, color, type="player"): # type can be "player" or "enemy"
        super().__init__()
        self.width = BULLET_WIDTH if type == "player" else ENEMY_BULLET_WIDTH
        self.height = BULLET_HEIGHT if type == "player" else ENEMY_BULLET_HEIGHT
        self.image = pygame.Surface([self.width, self.height])
        self.image.fill(color)
        self.rect = self.image.get_rect()
        self.rect.centerx = x
        self.rect.centery = y # Start from center y of shooter for player, bottom for enemy
        if type == "player":
            self.rect.bottom = y # Player bullet starts at player's top
        else: # Enemy bullet
            self.rect.top = y # Enemy bullet starts at enemy's bottom

        self.speed_y = speed_y

    def update(self):
        self.rect.y += self.speed_y
        if self.rect.bottom < 0 or self.rect.top > SCREEN_HEIGHT:
            self.kill() # Remove from all groups if off-screen


class PowerUpItem(pygame.sprite.Sprite):
    def __init__(self, center_x, center_y, power_up_type):
        super().__init__()
        self.power_up_type = power_up_type
        self.radius = POWER_UP_RADIUS
        
        item_color = ORANGE # Default for RapidFire
        if self.power_up_type == "SHIELD":
            item_color = SHIELD_BLUE
            self.radius = POWER_UP_RADIUS + 2 # Shield item slightly larger

        self.image = pygame.Surface([self.radius * 2, self.radius * 2], pygame.SRCALPHA)
        pygame.draw.circle(self.image, item_color, (self.radius, self.radius), self.radius)
        self.rect = self.image.get_rect(center=(center_x, center_y))
        self.speed = POWER_UP_SPEED

    def update(self):
        self.rect.y += self.speed
        if self.rect.top > SCREEN_HEIGHT:
            self.kill()

    def apply_effect(self, player):
        if self.power_up_type == "RapidFire":
            player.activate_rapid_fire()
        elif self.power_up_type == "SHIELD":
            player.activate_shield()
        self.kill()
