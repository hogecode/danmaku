class DPlayerComment {
  final num time;
  final String type;
  final String size;
  final String color;
  final String? author;
  final String text;

  DPlayerComment({
    required this.time,
    required this.type,
    required this.size,
    required this.color,
    this.author,
    required this.text,
  });

  factory DPlayerComment.fromJson(Map<String, dynamic> json) {
    return DPlayerComment(
      time: json['time'] as num,
      type: json['type'] as String? ?? 'normal',
      size: json['size'] as String? ?? 'normal',
      color: json['color'] as String? ?? '#ffffff',
      author: json['author'] as String?,
      text: json['text'] as String,
    );
  }
}
