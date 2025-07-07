from rest_framework import serializers
from .models import Problem,TestCase,Submission,Topic,LanguageChoices
from users.models import CustomUser

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'name']
        
class ProblemSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)
    topic_names = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
        help_text="List of topic names (strings) to assign to the problem. Will be created if not exist."
    )
    author = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Problem
        fields = [
            'id','slug','title', 'description', 'difficulty',
            'topics','topic_names',
            'time_limit','memory_limit',
            'created_at','updated_at',
            'author',
        ]

    def create(self, validated_data):
        topic_names = validated_data.pop('topic_names', [])
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        problem = super().create(validated_data)
        # Assign topics by name (create if not exist)
        for name in topic_names:
            topic, _ = Topic.objects.get_or_create(name=name)
            problem.topics.add(topic)
        return problem

    def update(self, instance, validated_data):
        topic_names = validated_data.pop('topic_names', None)
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        # Update topics if provided
        if topic_names is not None:
            instance.topics.clear()
            for name in topic_names:
                topic, _ = Topic.objects.get_or_create(name=name)
                instance.topics.add(topic)
        return instance
        
class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = [
            'id', 'problem', 'input_file', 'output_file',
            'is_sample', 'is_hidden', 'explanation'
        ]
        
        
class SubmissionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    problem_title = serializers.CharField(source='problem.title', read_only=True)

    class Meta:
        model = Submission
        fields = [
            'id', 'user', 'problem', 'problem_title',
            'code', 'language', 'status', 'verdict',
            'time_taken', 'memory_used',
            'submitted_at', 'evaluated_at'
        ]
        read_only_fields = ['status', 'verdict', 'time_taken', 'memory_used', 'submitted_at', 'evaluated_at']


class SubmissionCreateSerializer(serializers.ModelSerializer):
    language = serializers.ChoiceField(choices=LanguageChoices.choices)
    problem = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Submission
        fields = ['problem', 'code', 'language']