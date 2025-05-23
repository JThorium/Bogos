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
PURPLE = (128, 0, 128) # UFO Gamma color
BRIGHT_YELLOW = (255, 255, 102) # UFO Gamma bullet color
SPREAD_ITEM_COLOR = (30, 200, 30) # Distinct green for Spread Shot item
PLAYER_SPREAD_COLOR = (240, 240, 240) # Near white for player when spread is active


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
        "bullet_color": MAGENTA, 
        "width": 50, 
        "height": 50,
    },
    "GAMMA": {
        "name": "Gamma",
        "color": PURPLE,
        "speed": 6, # Faster than Alpha
        "shoot_cooldown_normal": 500, # Same as Alpha
        "shoot_cooldown_rapid": 150,  # Same as Alpha
        "bullet_speed": -15, # Significantly faster bullets
        "bullet_color": BRIGHT_YELLOW,
        "width": 50,
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
POWER_UP_RAPID_FIRE_DURATION_MS = 7000 # Renamed for clarity
POWER_UP_SPREAD_SHOT_DURATION_MS = 8000 # Spread shot duration

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
        self.is_spread_shot_active = False
        self.spread_shot_end_time = 0
        
        self.has_shield = False
        
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
            bullet_dx_main = 0
            bullet_dy_main = self.bullet_speed # UFO-specific vertical speed

            if self.is_spread_shot_active:
                # Main bullet (center)
                bullet_center = Bullet(self.rect.centerx, self.rect.top, bullet_dx_main, bullet_dy_main, self.bullet_color)
                # Left bullet
                bullet_left = Bullet(self.rect.centerx, self.rect.top, -3, bullet_dy_main * 0.9, self.bullet_color)
                # Right bullet
                bullet_right = Bullet(self.rect.centerx, self.rect.top, 3, bullet_dy_main * 0.9, self.bullet_color)
                
                all_sprites_group.add(bullet_center, bullet_left, bullet_right)
                bullets_group.add(bullet_center, bullet_left, bullet_right)
            else: # Normal shot
                bullet = Bullet(self.rect.centerx, self.rect.top, bullet_dx_main, bullet_dy_main, self.bullet_color)
                all_sprites_group.add(bullet)
                bullets_group.add(bullet)
            return True # Indicates a shot was fired
        return False # Indicates cooldown or other restriction prevented shooting

    def activate_rapid_fire(self):
        self.rapid_fire_active = True
        self.rapid_fire_end_time = pygame.time.get_ticks() + POWER_UP_RAPID_FIRE_DURATION_MS
        self.current_shoot_cooldown = self.shoot_cooldown_rapid

    def activate_shield(self):
        self.has_shield = True

    def lose_shield(self):
        self.has_shield = False
        
    def activate_spread_shot(self):
        self.is_spread_shot_active = True
        self.spread_shot_end_time = pygame.time.get_ticks() + POWER_UP_SPREAD_SHOT_DURATION_MS

    def deactivate_spread_shot(self):
        self.is_spread_shot_active = False

    def update(self):
        current_time = pygame.time.get_ticks()

        # Handle timers first
        if self.rapid_fire_active and current_time > self.rapid_fire_end_time:
            self.rapid_fire_active = False
            self.current_shoot_cooldown = self.shoot_cooldown_normal
        
        if self.is_spread_shot_active and current_time > self.spread_shot_end_time:
            self.deactivate_spread_shot()

        # Determine display color based on state precedence: Shield > SpreadShot > RapidFire > Base
        if self.has_shield:
            self.current_display_color = GOLD 
        elif self.is_spread_shot_active:
            self.current_display_color = PLAYER_SPREAD_COLOR
        elif self.rapid_fire_active:
            self.current_display_color = CYAN 
            self.current_shoot_cooldown = self.shoot_cooldown_rapid # Ensure cooldown is rapid if this state is active
        else: # No active power-ups affecting color, or rapid fire expired
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
    def __init__(self, x, y, dx, dy, color, type="player"): # dx for horizontal, dy for vertical
        super().__init__()
        self.width = BULLET_WIDTH if type == "player" else ENEMY_BULLET_WIDTH
        self.height = BULLET_HEIGHT if type == "player" else ENEMY_BULLET_HEIGHT
        self.image = pygame.Surface([self.width, self.height])
        self.image.fill(color)
        self.rect = self.image.get_rect()
        
        self.dx = dx
        self.dy = dy

        if type == "player":
            self.rect.centerx = x
            self.rect.bottom = y # Player bullet starts at player's top
        else: # Enemy bullet (assumes dx=0 for now for enemies)
            self.rect.centerx = x
            self.rect.top = y 

    def update(self):
        self.rect.x += self.dx
        self.rect.y += self.dy
        if self.rect.bottom < 0 or self.rect.top > SCREEN_HEIGHT or \
           self.rect.left > SCREEN_WIDTH or self.rect.right < 0:
            self.kill() 


class PowerUpItem(pygame.sprite.Sprite):
    def __init__(self, center_x, center_y, power_up_type):
        super().__init__()
        self.power_up_type = power_up_type
        self.radius = POWER_UP_RADIUS
        
        item_color = ORANGE 
        if self.power_up_type == "SHIELD":
            item_color = SHIELD_BLUE
            self.radius = POWER_UP_RADIUS + 2 
        elif self.power_up_type == "SPREAD_SHOT":
            item_color = SPREAD_ITEM_COLOR
            self.radius = POWER_UP_RADIUS # Standard size or new size

        self.image = pygame.Surface([self.radius * 2, self.radius * 2], pygame.SRCALPHA)
        pygame.draw.circle(self.image, item_color, (self.radius, self.radius), self.radius) # Draw as circle
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
        elif self.power_up_type == "SPREAD_SHOT":
            player.activate_spread_shot()
        self.kill()
