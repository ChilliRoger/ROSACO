export interface Caption {
  id: string;
  text: string;
  votes: number;
  userId: string;
}

export interface Round {
  id: string;
  memeUrl: string;
  captions: Caption[];
  status: 'submission' | 'voting' | 'results';
}

export interface InitResponse {
  type: 'init';
  postId: string;
  round: Round;
  username: string;
}

export interface CaptionResponse {
  type: 'caption';
  round: Round;
}

export interface VoteResponse {
  type: 'vote';
  round: Round;
}

export interface NextRoundResponse {
  type: 'next-round';
  round: Round;
}