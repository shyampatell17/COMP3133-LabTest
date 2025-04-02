export interface SpaceXMission {
  flight_number: number;
  mission_name: string;
  launch_year: string;
  details: string;
  links: {
    mission_patch_small: string;
    article_link: string;
    wikipedia: string;
    video_link: string;
  };
  rocket: {
    rocket_name: string;
    rocket_type: string;
  };
}

export interface LaunchSite {
  site_name_long: string;
}

export interface MissionDetails extends SpaceXMission {
  launch_site: LaunchSite;
  launch_success: boolean;
  launch_date_utc: string;
} 