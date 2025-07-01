from rest_framework import serializers
from .models import Problem,TestCase,Submission,Topic,LanguageChoices
from users.models import CustomUser

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'name']
        
class ProblemSerializer(serializers.ModelSerailizer):
    topics = TopicSerializer(many = True, read_only = True)
    topic_ids = serializers.PrimaryKeyRelatedFields(
        queryset = Topic.objects.all(),
        many = True,
        write_only = True,
        source = 'topics'
    )
    class Meta:
        model = Problem
        fields = [
            'id','title', 'description', 'difficulty',
            'topics','topic_ids',
            'time_limit','memory_limit',
            'created_at','updated_at'
        ]
        
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

    class Meta:
        model = Submission
        fields = ['problem', 'code', 'language']